/** @template T, S
 * @typedef {{ [K in keyof T]: T[K] extends S ? K : never }} WithValueType
 */
/**
 * Generic type that comprises the set of keys of T for which T[key] has type S
 *
 * @template T, S
 * @typedef {keyof Pick<T, WithValueType<T, S>[keyof T]>} KeysWithValueType
 */
/** @typedef {import('firebase').firestore.Timestamp} Timestamp */

/**
 * @typedef {any} Plog
 */

/** @typedef {{ completed: Timestamp, updated: Timestamp } & { [k in
 PropertyKey ]: any}} AchievementData */
/**
 * @typedef {Object} AchievementHandler
 * @property {AchievementData} initial
 * @property {(previous: AchievementData, plog: Plog) => AchievementData} update
 */

/**
 * @returns {AchievementHandler}
 */
function _makeCountAchievement(target) {
  return {
    initial: {
      completed: null,
      updated: null,
      count: 0
    },
    update(previous, plog) {
      const {count = 0} = previous;
      return {
        completed: count + 1 >= target ? plog.DateTime : null,
        updated: plog.DateTime,
        count: count + 1,
      };
    }
  };
}

const AchievementHandlers = {
  ['firstPlog']: _makeCountAchievement(1),
  ['100Club']: _makeCountAchievement(100),
  ['1000Club']: _makeCountAchievement(1000)
};

/** @typedef {keyof typeof AchievementHandlers} AchievementType */

/** @typedef {{ [k in AchievementType]?: AchievementData }} UserAchievements */

/**
 * Updates a user's achievements. Returns the updated achievements and an array
 * of achievement types that have not yet been initialized.
 *
 * @param {UserAchievements} achievements
 * @param {Plog|Plog[]} newPlogs
 *
 * @returns {{ achievements: UserAchievements, needInit: AchievementType[] }}
 */
function updateAchievements(achievements, newPlogs) {
  /** @type {AchievementType[]} */
  const names = Object.keys(AchievementHandlers);
  const needInit = [];

  const plogs = Array.isArray(newPlogs) ? newPlogs : [newPlogs];

  const updatedAchievements = names.reduce((updated, name) => {
    const current = updated && updated[name];
    const handler = AchievementHandlers[name];

    if (!current)
      needInit.push(name);
    else if (current.completed)
      return updated;

    return Object.assign(
      updated || {},
      { [name]: plogs.reduce(handler.update, current || { ...handler.initial }) }
    );
  }, achievements);

  return {
    achievements: updatedAchievements,
    needInit
  };
}

/**
 * @param {Parameters<typeof updateAchievements>} args
 */
const updateAchievementsLocal = (...args) => (updateAchievements(...args).achievements);

/**
 * Records aggregated stats for a particular time unit
 *
 * @typedef {object} PlogStats
 * @property {string} whenID - used as an identifier for the unit on which the
 *   stats are aggregated. E.g., if the user's most recent plog is on 4/3/21,
 *   the year PlogStats would have a `whenID` value of `2021` and the `month`
 *   PlogStats would have a `whenD` value of `2021-4`
 * @property {number} milliseconds - total time plogged during this time period
 * @property {number} count
 */

/**
 * Caches general stats about usage, including aggregates for the month and year
 * when the user most recently plogged.
 *
 * @typedef {object} UserStats
 * @property {PlogStats} [month]
 * @property {PlogStats} [year]
 * @property {PlogStats} [total]
 */

/** @typedef {KeysWithValueType<UserStats, PlogStats>} TimeUnit */
/** @typedef {{ unit: TimeUnit, when: (dt: Date) => string }} TimeUnitConfig */

/** @type {TimeUnitConfig[]} */
const timeUnits = [
  { unit: 'month', when: dt => `${dt.getFullYear()}-${dt.getMonth()+1}` },
  { unit: 'year', when: dt => ''+dt.getFullYear() },
  { unit: 'total', when: _ => 'total' },
];

/**
 * @typedef {object} UserData
 * @property {UserStats} stats
 * @property {UserAchievements} achievements
 */

/**
 * @param {UserData['stats']} stats
 * @param {PlogData} plog
 */
function updateStats(stats, plog, date=new Date()) {
  if (!stats) stats = {};

  for (let {unit, when} of timeUnits) {
    const whenValue = when(date);
    let unitStats = stats[unit];
    if (!unitStats || unitStats.whenID !== whenValue) {
      stats[unit] = unitStats = { milliseconds: 0, count: 0, whenID: whenValue };
    }

    unitStats.milliseconds += plog.PlogDuration || 0;
    unitStats.count += 1;
  }

  return stats;
}

module.exports = {
  AchievementHandlers,
  timeUnits,
  updateAchievements,
  updateAchievementsLocal,
  updateStats,
};
