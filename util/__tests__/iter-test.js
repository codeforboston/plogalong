import * as $iter from '../iter';

const randInt = (max, min=0, round=Math.ceil) =>
      min+round(Math.random()*(max-min));

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
  it('should split an array into subarrays of correct size', () => {
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

describe('normalized lists', () => {
  const list = $iter.times(randInt(100), id => ({ id, value: randInt(1000) }));
  const norm = $iter.normList(list);

  it('should be invertible when ids are not repeated', () => {
    expect($iter.denormList(norm)).toStrictEqual(list);
  });

  it('should allow filtering', () => {
    const test = randInt(1000);
    const filtered = $iter.denormList($iter.filterNorm(norm, item => (item.value > test)));
    for (const item of filtered) {
      expect(item.value).toBeGreaterThan(test);
    }
  });
});
