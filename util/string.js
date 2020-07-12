import moment from 'moment';


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

export function formatDate(dt) {
  return moment(dt).calendar(null, {
    sameDay: '[today]',
    nextDay: '[tomorrow]',
    nextWeek: 'dddd',
    lastDay: '[yesterday]',
    lastWeek: '[on] MMMM Do',
    sameElse: '[on] MMMM Do'
  });
}

export function formatDuration(ms, plogFormat) {
  const s = Math.round(ms / 1000);
  if (s < 60) {
    return plogFormat ? `1 plogging minute` : `1 minute`;
  }

  let m = Math.floor(s / 60);
  if (m < 60) {
    return plogFormat
      ? `${m} plogging minute${m === 1 ? '' : 's'}`
      : `${m} minute${m === 1 ? '' : 's'}`;
  }

  let h = Math.floor(m / 60);
  return plogFormat
    ? `${h} plogging hour${h === 1 ? '' : 's'}`
    : `${h} hour${h === 1 ? '' : 's'}`;
}
