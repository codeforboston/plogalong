const $R = Symbol();
export const $delete = Symbol();

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
  const { [k]: v, ...mrest } = m;
  const last = !rest.length;
  const updatedVal = last && fn(!(k in m) ? missingVal : v);

  if (updatedVal === $delete) {
    return mrest;
  }

  return {
    ...mrest,
    [k]: last ?
      updatedVal :
      _doUpdateInCopying(v === undefined || v === null ? {} : v, rest, fn, missingVal)
  };

}

const toFn = x =>
      typeof x === 'function' ? x : (_ => x);

/**
 * @param {any} m
 * @param {string[]} ks
 */
export const updateInCopy = (m, ks, fn, missingVal=undefined) =>
  _doUpdateInCopying(m, [...ks], toFn(fn), missingVal);

export function deleteIn(state, ks) {
  return updateInCopy(state, ks, _ => $delete);
}


/**
 * Make a speculative change to state
 *
 * @param {any} state
 * @param {string[]} keypath
 */
export function specUpdate(state, keypath, updater, missingValue=$delete) {
  updater = toFn(updater);

  let oldValue;
  const updated = updateInCopy(state, keypath, v => {
    oldValue = v;
    return updater(v);
  }, missingValue);
  if (!updated[$R])
    updated[$R] = {};

  updated[$R][keypath.join('.')] = oldValue;
  return updated;
};

/** @type {typeof specUpdate} */
export function revert(state, keypath) {
  const oldValue = state[$R] && state[$R][keypath.join('.')];
  const updated = updateInCopy(state, keypath, oldValue);
  if (updated[$R]) delete state[$R][keypath.join('.')];
  return updated;
}

/** @type {typeof specUpdate} */
export const commit = (state, keypath) => {
  if (state[$R]) delete state[$R][keypath.join('.')];
  return state;
};
