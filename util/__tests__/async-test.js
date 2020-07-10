import { Queue, wait, rateLimited } from '../async';

describe('Queue', () => {
  it('', async () => {
    const queue = new Queue();

    const results = {};
    const consumer = async label => {
      results[label] = [];

      while (true) {
        try {
          results[label].push(await queue.get());
          await wait(10);
        } catch (err) {
          break;
        }
      }
    };

    const A = consumer('A');
    const B = consumer('B');

    for (let i = 1; i < 100; ++i)
      queue.push(i);

    await(queue.push(100));
    queue.done();
    await Promise.all([A, B]);

    expect(Object.values(results).reduce((n, l) => n+l.length, 0)).toBe(100);
  });
});

describe('Rate limit', () => {
  it('', async () => {
    const results = [];
    const limitedFn = rateLimited(val => {
      results.push(val);
    }, 50);

    await new Promise(resolve => {
      let i = 0;
      const intv = setInterval(() => {
        limitedFn(Date.now());

        if (i++ >= 20) {
          clearInterval(intv);
          resolve();
        }
      }, 10);
    });

    expect(results).toHaveLength(5);
  });
});
