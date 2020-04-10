import { useEffect, useRef } from 'react';


export const useEffectWithPrevious = (callback, deps) => {
  const refs = deps.map(() => useRef());
  useEffect(() => {
    callback(...refs.map(r => r.current));
    refs.forEach((r, i) => {
      r.current = deps[i];
    });
  }, deps);
};
