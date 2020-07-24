function toBeSorted(received, {getter, dir='asc'} = {}) {
  const cmp = dir === 'asc' ? ((a, b) => a <= b) : ((a, b) => a >= b);
  if (!getter) getter = (x => x);

  let previousValue;
  for (const item of received) {
    const value = getter(item);
    if (previousValue !== undefined && !cmp(previousValue, value)) {
      const rel = dir === 'asc' ? '>=' : '<=';
      return {
        message: () => `expected value (${value}) of ${item} to be ${rel} ${previousValue}`,
        pass: false
      };
    }

    previousValue = value;
  }

  const order = dir === 'asc' ? 'ascending' : 'descending';
  return {
    message: () => `expected ${received} not to be in ${order} order`,
    pass: true
  };
}

expect.extend({
  toBeSorted,
  toBeSortedDesc(received, options) {
    return toBeSorted(received, Object.assign({ dir: 'desc' }, options));
  },
  toContainBefore(received, a, b, { eq, getter } = {}) {
    if (!eq) {
      if (getter)
        eq = (a, b) => (getter(a) === getter(b));
      else
        eq = (a, b) => (a === b);
    }

    let i = 0, aIndex, bIndex;
    for (const item of received) {
      if (aIndex === undefined) {
        if (eq(a, item)) {
          aIndex = i;
        } else if (eq(b, item)) {
          return {
            message: () => `Expected ${a} to come before ${b} in ${received}`,
            pass: false
          };
        }
      } else if (eq(b, item)) {
        return {
          message: () => `Expected ${a} not to come before ${b}`,
          pass: true
        };
      }
      ++i;
    }

    let missing = [];
    if (aIndex === undefined)
      missing.push(a);
    if (bIndex === undefined)
      missing.push(b);

    return {
      message: () => missing.map(v => `Did not find ${v}`).join(', '),
      pass: false
    };
  }
});
