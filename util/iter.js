/**
 * @template Fn
 * @param {number} n
 * @param {Fn} fn
 * @returns {ReturnType<Fn>[]}
 */
const times = (n, fn) => {
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
function keep(fn, xs) {
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

function update(m, spec) {
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
function indexBy(xs, lookup) {
  const fn = typeof lookup === 'function' ? lookup : (x => x[lookup]);
  return xs.reduce((m, item) => {
    m[fn(item)] = item;
    return m;
  }, {});
}

const empty = obj => {
  for (let k in obj) {
    if (obj.hasOwnProperty(k))
      return false;
  }

  return true;
};

const getter = f => (
  typeof f === 'string' ? (x => x[f]) : f
);

/**
 * @template T
 * @typedef {object} NormalizedList
 * @property {string[]} ids
 * @property {{ [k in string]: T }} data
 */

/**
 * @template {NormalizedList<any>} L
 * @typedef {L extends NormalizedList<infer T> ? T[] : never} DenormalizedList
 */

/**
 * @template {any} T
 * @param {T[]} list
 *
 * @returns {NormalizedList<T>}
 */
function normList(list, { getID = 'id' } = {}) {
  getID = getter(getID);
  return (list || []).reduce((m, x) => {
    const id = getID(x);
    m.ids.push(id);
    m.data[id] = x;
    return m;
  }, { ids: [], data: {} });
}

/**
 * @template T
 *
 * @param {NormalizedList<T>} input
 */
function denormList(input, options = {}) {
  const { idKey = 'id' } = options;
  return input ?
    input.ids.map(idKey ?
                  id => Object.assign({ [idKey]: id }, input.data[id]) :
                  id => input.data[id]) :
    [];
}

/**
 * @template {any} T
 * @param {NormalizedList<T>} input
 * @param {(item: T, id: any) => any} fn
 *
 * @returns {NormalizedList<T>}
 */
function filterNorm(input, fn) {
  const data = input && input.data || {};
  const ids = input && input.ids || [];
  return ids.reduce(
    (m, id) => {
      if (fn(data[id], id)) {
        m.data[id] = data[id];
        m.ids.push(id);
      }

      return m;
    },
    { ids: [], data: {} });
}

/**
 * @template T, U
 * @param {NormalizedList<T>} input
 * @param {(item: T, id: string) => U} fn
 */
const mapNorm =(input, fn) => input.ids.map(id => fn(input.data[id], id));

/**
 * @template T
 * @param {T[]} xs
 * @param {number} n
 *
 * @returns {T[][]}
 */
function partition(xs, n) {
  const splitXs = [];
  for (let i = 0, l = xs.length; i < l; i += n) {
    splitXs.push(xs.slice(i, i+n));
  }
  return splitXs;
}


module.exports = {
  denormList,
  empty,
  filterNorm,
  indexBy,
  keep,
  mapNorm,
  normList,
  times,
  update,
  partition,

};
