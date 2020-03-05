import * as Immutable from "immutable";


const $R = Symbol();

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
