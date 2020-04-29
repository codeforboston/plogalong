import { keep } from './iter';

import AchievedTypes from '../constants/AchievedMockup';

/** @typedef {import('../firebase/project/functions/shared').UserAchievements} UserAchievements */

/**
 * @param {UserAchievements} achievements
 * @param {keyof UserAchievements} achType
 */
export const processAchievement = (achievements, achType) => {
  const a = achievements[achType];
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

/**
 * @typedef {Object} ProcessAchievementsOptions
 * @property {boolean} [partial] include achievements that are started but incomplete
 * @property {boolean} [hidden] include achievements that are hidden
 * @property {boolean} [unstarted] include achievements that haven't been started
 */
/**
 * @param {UserAchievements} achievements
 * @param {ProcessAchievementsOptions} [show]
 */
export const processAchievements = (achievements, show = {}) => {
  const {partial=true, unstarted=false, hidden=false} = show;

  return keep(achType => {
    const a = achievements[achType];

    if (!partial && !a.completed)
      return null;

    const achievement = processAchievement(achievements, achType);
    return (unstarted || achievement.progress) && (hidden || !achievement.hide) ? achievement : null;
  }, Object.keys(achievements)).sort(
    ({updated: a, completed: ac}, {updated: b, completed: bc}) => (
      ac ? (bc ?
            (ac.toMillis() > bc.toMillis() ? -1 : 1)
            : -1)
        : (bc ? 1
           : (a ?
              (b ? (a.toMillis() > b.toMillis() ? -1 : 1)
               : -1)
              : (b ? 1 : -1)))
    ));
  };
