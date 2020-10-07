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
  const originalA = achievements[achType];
  let a = originalA;

  // if (!a) return null;
  if (!a) {a = achType}

  const {hide, icon, progress, detailText, ...rest} = AchievedTypes[achType];
 
  const progressPercent = a.completed ? 100 : progress && originalA ? progress(originalA) : 0;
  return {
    progress: progressPercent,
    hide: originalA && hide ? hide(achievements) : false,
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
 * Sort order: completed achievements, in descending order of completion time,
 * then in-progress achievements, (then points if time is equal, then name if
 * points are equal; in descending update order; then the rest). If two
 * achievements were completed or updated at the same time, sort by the point
 * value. If the point value is also equal, sort by achievement name
 * (ascending).
 *
 * @type {AchievementSorter}
 */
const achievementSorter = ({updated: a, completed: ac, badgeTheme: btA, points: pA},
                           {updated: b, completed: bc, badgeTheme: btB, points: pB}) =>
      ((ac ? (bc ? cmp(bc, ac) : -1)
       : (bc ? 1
          : (a ?
             (b ? cmp(b, a) : -1)
             : (b ? 1 : 0)))))
      || cmp(pB, pA) || cmp(btA, btB);

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
    if (!partial && (!a || !a.completed))
      return null;
    const achievement = processAchievement(achievements, achType);
    return (achievement &&
            (unstarted || achievement.progress) &&
            (hidden || !achievement.hide)) ? achievement : null;
  }, Object.keys(AchievedTypes)).sort(sorter);
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

/**
 * @param {UserAchievements} achievements
 *
 * @returns { number }
 */
export function calculateCompletedBadges(achievements) {
  let badgeCount = 0;
  for (const badge in achievements) {
    if (achievements[badge] != null && achievements[badge].completed != null) {
      badgeCount += 1;
    }
  }
  return badgeCount;
}

/**
 * @param {shared.UserPlogStats} userPlogStats
 *
 * BonusMinutes + Milliseconds
 * @returns { number } 
 */
export function calculateTotalPloggingTime(userPlogStats) {
  return (userPlogStats.milliseconds||0) + (60000 * userPlogStats.bonusMinutes)
}