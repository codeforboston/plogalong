const $R = Symbol();

export function getIn(m, ks, notFound=undefined) {
  let v = m;
  for (let i = 0, l = ks.length; i < l; ++i) {
    if (v === undefined || v === null)
      return notFound;

    v = v[ks[i]];
  }

  // Seems strictly more accurate to return null if the path is fully realized
  // and the value stored there is null, but more useful to treat nulls the same
  // way as undefineds
  // return v === undefined ? notFound : v;
  return v === undefined || v === null ? notFound : v;
}

export function getInWith(m, ks, fn) {
  const nfMarker = Symbol();
  const val = getIn(m, ks, nfMarker);

  return val !== nfMarker ? fn(val) : val;
}

function _doUpdateInCopying(m, ks, fn, missingVal=undefined) {
  const [k, ...rest] = ks;
  const v = m[k];

  return {
    ...m,
    [k]: rest.length ?
      _doUpdateInCopying(v === undefined || v === null ? {} : v, rest, fn) :
      fn(v === undefined ? missingVal : v)
  };

}

/**
 * @param {any} m
 * @param {string[]} ks
 */
export const updateInCopy = (m, ks, fn) => _doUpdateInCopying(m, [...ks],
                                                              typeof fn === 'function' ? fn : () => fn);


/**
 * Make a speculative change to state
 *
 * @template K, V
 * @param {Immutable.Map<K, V>} state
 * @param {Iterable<K>} keypath
 * @returns Immutable.Map<K, V>
 */
export function specUpdate(state, keypath, ...args) {
  const optArgs = args.slice(0, -1);
  let updater = args[args.length-1];
  if (typeof updater !== 'function') {
    const val = updater;
    updater = (_ => val);
  }
  return state
    .setIn([$R, ...keypath], state.getIn(keypath))
    .updateIn(keypath, ...optArgs, updater);
};

/** @type {typeof specUpdate} */
export function revert(state, keypath) {
  const revertPath = [$R, ...keypath];
  const revertValue = state.getIn(revertPath);

  return (
    revertValue === undefined ?
      state.removeIn(keypath) :
      state.setIn(keypath, revertValue)
  ).removeIn(revertPath);
}

/** @type {typeof specUpdate} */
export const commit = (state, keypath) => state.removeIn([$R, ...keypath]);
