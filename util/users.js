import { keep } from './iter';

import AchievedTypes from '../constants/AchievedMockup';

/** @typedef {import('../firebase/project/functions/shared').UserAchievements} UserAchievements */


export const processAchievements = (achievements = {}, includePartial=true) =>
  keep(achType => {
    const a = achievements[achType];

    if (!includePartial && !a.completed)
      return null;

    const {icon, progress, detailText, ...rest} = AchievedTypes[achType];

    const progressPercent = a.completed ? 100 : progress && a ? progress(a) : 0;

    return progressPercent ? {
      progress: progressPercent,
      icon,
      key: achType,
      detailText: detailText && detailText(a),
      ...rest,
      ...a
    } : null;
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
