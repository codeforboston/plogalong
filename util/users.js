import * as shared from '../firebase/project/functions/shared';
const timeUnits = new Map(shared.timeUnits.map(tu => ([tu.unit, tu.when])));
import { keep } from './iter';

import AchievedTypes from '../constants/AchievedMockup';

/** @typedef {shared.UserData} UserData */
/** @typedef {shared.UserAchievements} UserAchievements */
/** @typedef {(a: AchievementInstance, b: AchievementInstance) => (-1 | 0 | 1)} AchievementSorter */

/**
 * @param {UserAchievements} achievements
 * @param {keyof UserAchievements} achType
 */
export const processAchievement = (achievements, achType) => {
  let a = achievements[achType];

  // if (!a) return null;
  if (!a) {a = achType}

  const {hide, icon, progress, detailText, ...rest} = AchievedTypes[achType];
 
  const progressPercent = a.completed ? 100 : progress && a ? progress(a) : 0;
  return {
    progress: progressPercent,
    hide: hide ? hide(achievements) : false,
    icon,
    key: achType,
    detailText: detailText && detailText(a),
    ...rest,
    ...a
  };
};

/** @typedef {ReturnType<typeof processAchievements>[0]} AchievementInstance */

export const cmp = (a, b) => a >= b ? (a <= b ? 0 : 1) : -1;

/**
 * Sort order: completed achievements, in descending order of completion time;
 * then in-progress achievements, in descending update order; then the rest. If
 * two achievements were completed or updated at the same time, sorts by the
 * achievement name (ascending).
 *
 * @type {AchievementSorter}
 */
const achievementSorter = ({updated: a, completed: ac, key: ak},
                           {updated: b, completed: bc, key: bk}) =>
      (ac ? (bc ? (cmp(bc, ac) || cmp(ak, bk)) : -1)
       : (bc ? 1
          : (a ?
             (b ? (cmp(b, a) || cmp(ak, bk)) : -1)
             : (b ? 1 : cmp(ak, bk)))));

/**
 * @typedef {Object} ProcessAchievementsOptions
 * @property {boolean} [partial] include achievements that are started but incomplete
 * @property {boolean} [hidden] include achievements that are hidden
 * @property {boolean} [unstarted] include achievements that haven't been started
 * @property {AchievementSorter} [sorter]
 */
/**
 * @param {UserAchievements} achievements
 * @param {ProcessAchievementsOptions} [options]
 *
 * @returns {ReturnType<typeof processAchievement>[]}
 */
export const processAchievements = (achievements, options = {}) => {
  const {partial=true, unstarted=false, hidden=false,
         sorter = achievementSorter} = options;
  return keep(achType => {
    const a = achievements[achType];
    if (!partial && !a.completed)
      return null;
    const achievement = processAchievement(achievements, achType);
    return (achievement &&
            (unstarted || achievement.progress) &&
            (hidden || !achievement.hide)) ? achievement : null;
  }, Object.keys(achievements)).sort(sorter);
};

/**
 * @param {{ data: UserData }} user
 * @param {shared.TimeUnit} unit
 *
 * @returns {shared.UserPlogStats}
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
