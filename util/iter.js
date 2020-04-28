/**
 * @template Fn
 * @param {number} n
 * @param {Fn} fn
 * @returns {ReturnType<Fn>[]}
 */
export const times = (n, fn) => {
  const arr = [];
  for (let i = 0; i < n; ++i)
    arr.push(fn(i));
  return arr;
};

/**
 * @template T
 * @template {(item: T, index?: i) => any} Fn
 * @param {Fn} fn
 * @param {T[]} xs
 * @returns {ReturnType<Fn>[]}
 */
export function keep(fn, xs) {
  const result = [];
  let i = 0;
  for (const x of xs) {
    const val = fn(x, i++);
    if (val) result.push(val);
  }
  return result;
}

function _doUpdate(m, k, spec) {
  if (k === '*') {
    Object.keys(m).forEach(mk => _doUpdate(m, mk, spec));
  } else if (typeof spec === 'function') {
    if (m[k] !== undefined)
      m[k] = spec(m[k]);
  } else if (spec) {
    if (m[k])
      update(m[k], spec);
  }
}

export function update(m, spec) {
  Object.keys(spec).forEach(k => {
    const childSpec = spec[k];
    const dotIdx = k.indexOf('.');

    if (dotIdx > -1) {
      const childKey = k.slice(0, dotIdx);
      const descendantSpec = { [k.slice(dotIdx+1)]: childSpec };

      _doUpdate(m, childKey, descendantSpec);
    } else {
      _doUpdate(m, k, spec[k]);
    }
  });
  return m;
}

/**
 * @template T
 * @param {T[]} xs
 * @template {keyof T | ((x: T) => any)} Lookup
 * @param {Lookup} lookup
 *
 * @returns {{[k in (Lookup extends keyof T ? T[Lookup] : ReturnType<Lookup>)]: T}}
 */
export function indexBy(xs, lookup) {
  const fn = typeof lookup === 'function' ? lookup : (x => x[lookup]);
  return xs.reduce((m, item) => {
    m[fn(item)] = item;
    return m;
  }, {});
}
