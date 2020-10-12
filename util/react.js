import { useEffect, useRef, useState, useCallback, useReducer, useMemo } from 'react';


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

const paramsReducer = (params, change) => ({ ...params, ...change });

/**
 * @template T
 * @param {T} init
 */
export const useParams = init => {
  const [params, setParams] = useReducer(paramsReducer, init);
  const setters = useRef({});

  return {
    /** @type {T} */
    params,
    setParams,
    /** @type {<K extends keyof T>(key: K) => ((val: T[K]) => void)} */
    setter: k => {
      if (!setters.current[k])
        setters.current[k] = (val => setParams({ [k]: val }));
      return setters.current[k];
    }
  };
};


export const useToggle = (init=false) => {
  const [status, setStatus] = useState(init);
  return [
    status,
    useCallback((show=null) => setStatus(isOn => typeof show === 'boolean' ? show : !isOn),
                [setStatus]),
    setStatus
  ];
};
