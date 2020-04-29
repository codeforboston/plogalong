import { useEffect, useRef, useState } from 'react';


export const useEffectWithPrevious = (callback, deps) => {
  const refs = deps.map(() => useRef());
  useEffect(() => {
    callback(...refs.map(r => r.current));
    refs.forEach((r, i) => {
      r.current = deps[i];
    });
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
