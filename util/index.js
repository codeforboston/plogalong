import * as shared from '../firebase/project/functions/shared';

const timeUnits = new Map(shared.timeUnits.map(tu => ([tu.unit, tu.when])));

export function formatDuration(ms) {
  const s = Math.round(ms/1000);
  if (s < 60)
    return `${s} seconds`;

  let m = Math.floor(s/60);
  if (m < 60)
    return `${m} minute${m === 1 ? '' : 's'}`;

  let h = Math.floor(m/60);
  return `${h} hour${h === 1 ? '' : 's'}`;
}

/**
 * @param {shared.TimeUnit} unit
 *
 * @returns {shared.PlogStats}
 */
export function getStats(user, unit, now=new Date()) {
  /** @type {shared.UserData['stats']} */
  const stats = user && user.data && user.data.stats || {};
  const currentWhenID = timeUnits.get(unit)(now);
  const defaults = {
    whenID: currentWhenID,
    milliseconds: 0,
    count: 0
  };

  if (!stats[unit] || stats[unit].whenID !== currentWhenID)
    return defaults;

  // Ensure that no keys are missing
  return Object.assign(defaults, stats[unit]);
}

export const pluralize = (n, noun, plural=`${noun}s`) =>
  `${n} ${n === 1 ? noun : plural}`;

export { keep, indexBy, times } from './iter';
