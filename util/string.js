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

/**
 * @param {string} url
 */
export function parseURL(url) {
  const m = url.match(URL_PATTERN);
  if (!m) return null;

  const [, protocol, host, port, path, search] = m;

  const params = !search ? {} : search.split('&').reduce((p, kv) => {
    const [k, v] = kv.split('=');
    p[decodeURIComponent(k)] = decodeURIComponent(v);
    return p;
  }, /** @type {{ [k in string]: string }} */({}));

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

/**
 * @param {Date} dt
 */
export function formatDateOrRelative(dt) {
  const now = new Date();

  if (now.getTime() - dt.getTime() <= 6*60000*60) {
    return moment(dt).fromNow();
  }

  return formatDate(dt);
}

/**
 * @param {number} ms Duration in milliseconds
 */
export function formatDuration(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) {
    return `1 minute`;
  }

  let m = Math.floor(s / 60);
  if (m < 60) {
    return `${m} minute${m === 1 ? '' : 's'}`;
  }

  let h = Math.floor(m / 60);
  return `${h} hour${h === 1 ? '' : 's'}`;
}

export function formatPloggingMinutes(ms) {
  const m = Math.max(1, Math.round(ms / 60000));
  return pluralize(m, 'plogging minute');
}
