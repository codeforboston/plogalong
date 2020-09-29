import * as $iter from '../iter';

const randInt = (max, min=0, round=Math.ceil) =>
      round(Math.random()*(max-min));

describe('times', () => {
  it('shoud be called n times', async () => {
    const n = randInt(20);
    const myFn = jest.fn(args => args);

    const result = $iter.times(n, myFn);

    expect(result).toHaveLength(n);
    expect(myFn).toHaveBeenCalledTimes(n);
  });
});

describe('partition', () => {
  it('should split an array into subarrays of correct size', async () => {
    const totalLength = randInt(100);
    const arr = $iter.times(totalLength, () => 1);

    const n = randInt(10);
    const subarrays = $iter.partition(arr, n);

    expect(subarrays).toHaveLength(Math.ceil(totalLength/n));

    let remaining = totalLength;
    for (const subarr of subarrays) {
      expect(subarr).toHaveLength(Math.min(remaining, n));
      remaining -= n;
    }
  });
});
