/**
 * @param {string} str
 * @param {string|RegExp} patt
 */
export function indexOf(str, patt) {
  if (patt.exec) {
    const m = patt.exec(str);
    return m ? m.index : -1;
  }

  return str.indexOf(patt);
}

/**
 * @param {string} str
 * @param {string|RegExp} patt
 */
export function splitOnce(str, patt) {
  const idx = indexOf(str, patt);

  return idx > -1 ?
    [str.slice(0, idx), str.slice(idx)] :
    [str, ''];
}

export const pluralize = (n, noun, plural=`${noun}s`) =>
  `${n} ${n === 1 ? noun : plural}`;

const URL_PATTERN = /(?:([\w\-:]+):)?\/\/((?:[^/:?]|\.[^.])+)(?::(\d+))?(\/[^?]*)?(?:\?(.*))?/;

export function parseURL(url) {
  const m = url.match(URL_PATTERN);
  if (!m) return null;

  const [_, protocol, host, port, path, search] = m;

  const params = !search ? {} : search.split('&').reduce((p, kv) => {
    const [k, v] = kv.split('=');
    p[decodeURIComponent(k)] = decodeURIComponent(v);
    return p;
  }, {});

  return { protocol, host, port, path, search, params };
}
