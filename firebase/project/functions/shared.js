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

/** @typedef {{ completed: Timestamp, updated: Timestamp } & { [k in PropertyKey ]: any}} AchievementData */
/**
 * @typedef {Object} AchievementHandler
 * @property {AchievementData} initial
 * @property {(previous: AchievementData, plog: Plog) => AchievementData} update
 */

/** @typedef {(dt: Date) => Date} FloorDateFn */
/** @type {FloorDateFn} */
const floorDay = dt => (new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()));
/** @type {FloorDateFn} */
const floorWeek = dt => floorDay(new Date(dt.getTime() - dt.getDay()*86400000));
/** @type {FloorDateFn} */
const floorMonth = dt => new Date(dt.getFullYear(), dt.getMonth(), 1);

/** @typedef {(dt: Date, n: number=1) => Date} IncDateFn */
/** @type {IncDateFn} */
const incDay = (dt, n=1) => new Date(dt.getTime()+(n*86400000));
/** @type {IncDateFn} */
const incWeek = (dt, n=1) => incDay(dt, 7*n);
/** @type {IncDateFn} */
const incMonth = (dt, n=1) => new Date(new Date(dt).setMonth(dt.getMonth()+n));

/**
 * Creates a handler for an achievement that is completed when a user has
 * plogged a `target` number of plogs.
 *
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

/**
 * Creates a handler for an achievement 
 *
 * @param {number} target
 * @param {FloorDateFn} floor
 * @param {IncDateFn} inc
 * @returns {AchievementHandler}
 */
function _makeStreakHandler(target, floor=floorDay, inc=incDay) {
  const initial = {
    completed: null,
    updated: null,
    streak: 0,
    // Set when the streak is lost
    longestStreak: null,
    // Date when the longest streak was lost
    streakLost: null,
  };
  return {
    initial,
    update(previous, plog) {
      const {DateTime, TZ = 240} = plog;
      const localDate = new Date(DateTime.toDate().getTime() - TZ*60000);

      const {updated, streak} = previous;
      const localUpdated = new Date(updated.toDate().getTime() - TZ*60000);
      /** @type {Partial<typeof initial>} */
      const changes = {
        updated: DateTime
      };

      if (updated) {
        if (floor(inc(localDate, -1)).getTime() ===
            floor(localUpdated).getTime()) {
          changes.streak = streak + 1;
          if (changes.streak >= target) {
            changes.completed = DateTime;
          }
        } else {
          changes.streak = 1;

          if (streak > 1) {
            changes.longestStreak = streak;
            changes.streakLost = updated;
          }
        }
      }

      return Object.assign(previous, changes);
    }
  };
}

const AchievementHandlers = {
  ['firstPlog']: _makeCountAchievement(1),
  ['100Club']: _makeCountAchievement(100),
  ['1000Club']: _makeCountAchievement(1000),
  // ['jk ']
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
