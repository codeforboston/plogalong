/**
 * Wraps a function, returning a new rate-limited function that can be called no
 * more than once every `ms` milliseconds. If `fn` takes time to complete and
 * the rate-limited function is called while `fn` is running, the last
 * invocation will run `ms` milliseconds after `fn` finishes. In short, the most
 * recent invocation is always either run immediately or scheduled to run.
 *
 * @template {(...args: any) => PromiseLike<any>} Fn
 * @param {Fn} fn
 * @param {number} ms
 * @returns {Fn}
 */
export function rateLimited(fn, ms, throwOnDequeue=false, delayFirst=false) {
  let pending, dequeuePending, running, waiting, rejectWaiting,
      lastRun = delayFirst ? Date.now() : 0;

  return (...args) => {
    pending = new Promise(async (resolve, reject) => {
      if (running) {
        if (waiting)
          rejectWaiting();

        waiting = new Promise(res => {
          rejectWaiting = () => { res(false); };
          running.finally(() => res(true));
        });

        const proceed = await waiting;
        waiting = rejectWaiting = null;
        if (!proceed) {
          if (throwOnDequeue)
            reject(new Error('Dequeued'));
          return;
        }
        lastRun = Date.now();
      }

      const delay = ms - (Date.now() - lastRun);
      if (dequeuePending) {
        dequeuePending();
        dequeuePending = null;
      }

      const run = async () => {
        try {
          running = fn(...args);
          resolve(await running);
        } catch (err) {
          reject(err);
        } finally {
          running = null;
          lastRun = Date.now();
        }
      };

      if (delay > 0) {
        const timeout = setTimeout(run, delay);

        dequeuePending = () => {
          clearTimeout(timeout);
          if (throwOnDequeue)
            reject(new Error('Dequeued'));
        };
      } else {
        await run();
      }
    });

    return pending;
  };
}
/**
 * @template T
 */
export class Queue {
  /** @type {[T, () => ()][]} */
  _queue = []
  /** @type {(((item: T) => void), ((error: Queue.Complete) => void))[]} */
  _waiters = []
  /** @type {Queue.Complete} */
  _done = null

  _updateWaiters() {
    while (this._waiters.length && this._queue.length) {
      const [item, resolve] = this._queue.shift();
      const [resolveWaiter] = this._waiters.shift();

      resolveWaiter(item);
      resolve();
    }
  }

  /**
   * @param {T} item
   * @returns {Promise<null>}
   */
  push(item) {
    return new Promise((resolve, reject) => {
      if (this._done) {
        reject(this._done);
      } else {
        this._queue.push([item, resolve]);
        this._updateWaiters();
      }
    });
  }

  /**
   * @returns {Promise<T>}
   */
  get() {
    return new Promise((resolve, reject) => {
      if (this._done) {
        reject(this._done);
      } else {
        this._waiters.push([resolve, reject]);
        this._updateWaiters();
      }
    });
  }

  done() {
    const e = new Queue.Complete();
    for (const [_, rejectWaiter] of this._waiters) {
      rejectWaiter(e);
    }
    this._done = e;
    this._waiters = [];
    this._queue = [];
  }

  /**
   * @param {(item: T) => Promise<any>} callback
   * @param {() => any} [onComplete]
   */
  async loop(callback, onComplete=null) {
    try {
      while (true) {
        await callback(await this.get());
      }
    } catch (_) {
      if (onComplete) onComplete();
    }
  }
}

Queue.Complete = class extends Error {
  constructor() {
    super('Queue complete');
  }
};

export function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}


const mergeArgLists = arglists => (
  arglists[0].map((_, i) => arglists.map(args => args[i]))
);

const expandResultVal = (result, i) => Array.isArray(result) ? result[i] : result;

/**
 * Returns a function that collects consecutive invocations and invokes the
 * wrapped function `fn` with the merged arguments of those invocations.
 *
 * By default, arguments are merged item-wise. For example, closely spaced calls
 * of mergedFn(1, 2, 3) and mergedFn(9, 8, 7) will call `fn([1, 9], [2, 8], [3,
 * 7])`.
 *
 * The `expandResult` function is responsible for mapping the results of `fn`
 * back to callers. The default implementation will, given an array `results`,
 * return `results[i]` to the ith caller; otherwise, it will return the same
 * constant value to every caller.
 *
 * @param {(...any) => any} fn
 * @param {number} ms
 * @param {(arglists: any[]) => any} [mergeArgs]
 * @param {(result: any, i: number) => any} [expandResult]
 */
export function coalesceCalls(fn, ms, mergeArgs=mergeArgLists, expandResult=expandResultVal) {
  let lastRun, arglists = [], scheduled, resolvers = [];

  const doResolve = (vals, resolvers, type='resolve') => {
    resolvers.forEach((resolver, i) => {
      resolver[type](expandResult(vals, i));
    });
  };

  return (...args) => {
    arglists.push(args);

    const now = Date.now();

    if (lastRun === undefined)
      lastRun = now;

    const delay = ms - (now - lastRun);
    const promise = new Promise((resolve, reject) => {
      resolvers.push({ resolve, reject });
    });

    if (!scheduled) {
      const run = () => {
        try {
          const result = fn(...mergeArgs(arglists));
          if (result && result.then) {
            const savedResolvers = resolvers;
            result.then(
              vals => { doResolve(vals, savedResolvers); },
              err => { doResolve(err, savedResolvers, 'reject'); }
            );
          } else {
            doResolve(result, resolvers);
          }
        } catch (err) {
          doResolve(err, resolvers, 'reject');
        } finally {
          lastRun = Date.now();
          arglists = [];
          resolvers = [];
          scheduled = null;
        }
      };

      if (delay <= 0) {
        run();
      } else if (!scheduled) {
        scheduled = setTimeout(run, delay);
      }
    }

    return promise;
  };
}
