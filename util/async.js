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
