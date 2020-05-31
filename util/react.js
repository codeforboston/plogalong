import { useEffect, useRef, useState } from 'react';


/**
 * Helper that calls `callback` with the previous `deps` values whenever any of
 * them change.
 *
 * @param {any[]} deps
 * @param {(...args: typeof deps) => any} callback
 */
export const useEffectWithPrevious = (callback, deps) => {
  const ref = useRef(deps.map(_ => undefined));
  useEffect(() => {
    callback(...ref.current);
    ref.current = deps;
  }, deps);
};

/** @typedef {<T>(newState: T) => void} SetState */

/**
 * @template T
 * @param {T} init
 */
export const useParams = init => {
  const [params, setParams] = useState(init);

  return {
    params,
    setParams,
    /** @type {<K extends keyof T>(key: K) => ((val: T[K]) => void)} */
    setter: k => (val => setParams({ ...params, [k]: val }))
  };
};
