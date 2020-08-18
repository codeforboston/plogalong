import * as shared from '../firebase/project/functions/shared';

const timeUnits = new Map(shared.timeUnits.map(tu => ([tu.unit, tu.when])));

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

export { keep, indexBy, times } from './iter';
export { formatDate, formatDuration, parseURL, pluralize } from './string';
