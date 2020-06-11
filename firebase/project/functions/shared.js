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
 * @property {number} points
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


const localTZOffset = new Date().getTimezoneOffset();
const localPlogDate = ({DateTime, TZ}) => new Date(DateTime.toMillis() - (TZ-localTZOffset)*60000);

/**
 * Add a predicate to an existing achievement handler. Plogs that do not satisfy
 * `pred()` will be skipped.
 *
 * @param {(plog: any) => any} pred only consider plogs that satisfy a predicate
 * @param {AchievementHandler} handler
 * @returns {AchievementHandler}
 */
const _addPred = (pred, handler) => {
  const {update} = handler;
  handler.update = (previous, plog) => pred(plog) ? update(previous, plog) : previous;
  return handler;
};

/**
 * Creates a handler for an achievement that is completed when a user has
 * plogged a `target` number of plogs.
 *
 * @param {number} target
 * @param {number} points
 *
 * @returns {AchievementHandler}
 */
function _makeCountAchievement(target, points=50) {
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
    },
    points
  };
}

/**
 * Creates a handler for an achievement 
 *
 * @param {number} target
 * @param {number} points
 * @param {FloorDateFn} floor
 * @param {IncDateFn} inc
 *
 * @returns {AchievementHandler}
 */
function _makeStreakHandler(target, points, floor=floorDay, inc=incDay) {
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
    points,
    update(previous, plog) {
      const {DateTime, LocalDate, TZ} = plog;

      const {updated, streak} = previous;
      /** @type {Partial<typeof initial>} */
      const changes = {
        updated: DateTime
      };

      if (updated) {
        const localUpdated = new Date(updated.toMillis() - TZ*60000);
        if (floor(inc(LocalDate, -1)).getTime() ===
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

/**
 * Creates a handler for an achievement that is completed the first time a plog
 * satisfies the predicate function `pred`;
 *
 * @param {(plog) => any}
 * @param {number} [points=50]
 * @returns {AchievementHandler}
 */
const _makeOneShotAchievement = (pred, points=50) => ({
  initial: { completed: null },
  points,
  update: (previous, plog) =>  pred(plog) ? { completed: plog.DateTime } : previous
});

const withPlogMonthDay = fn => (({LocalDate}) => fn(LocalDate.getMonth(), LocalDate.getDate()));

// Full list of achievements:
// https://airtable.com/shrHq1EmZzFO7hiQe/tblbArS3zXcLPwdbm/viw9Jk1OkBKdN5Iwc?blocks=bip681nyUrUqlzD8e

// These handlers are only for the achievements that can be calculated using
// information on the plog and previous achievement data.

// This approach is enough to cover these achievements:
//   First Plog, Team Effort, True Native, Bug Zapper, Danger Pay, Daredevil,
//   100 Club, Dog Days, Spring Chicken, Fall Color, Polar Bear, Plog Away, 1000
//   club, Streaker

// The general approach will also work for these, once we assign geo labels to
// plogs:
//   Ranger, City Slicker, Nature Child, Street Cred, Oceanographer

// This has to be triggered by an invite:
//   Pay it Forward

// These achievements have to be run on local aggregates, which is something we
// don't calculate yet:
//   Busy Bee, Break the Seal
const AchievementHandlers = {
  ['firstPlog']: _makeCountAchievement(1, 50),
  ['100Club']: _makeCountAchievement(100, 1000),
  ['1000Club']: _makeCountAchievement(1000, 10000),
  streaker: _makeStreakHandler(7, 250),
  teamEffort: _makeOneShotAchievement(plog => plog.groupType === 'team', 20),
  bugZapper: _makeOneShotAchievement(
    plog => (plog.trashTypes||[]).includes('standing_water'), 20),
  dangerPay: _makeOneShotAchievement(
    plog => (plog.trashTypes||[]).find(type => type.match(/^glass|standing_water$/)), 20),
  daredevil: _makeOneShotAchievement(plog => plog.activityType === 'biking', 20),

  dogDays: _makeOneShotAchievement(withPlogMonthDay((m, d) => (m === 5 && d === 21) || m === 6 || m === 7 || (m === 8 && d < 21))),
  springChicken: _makeOneShotAchievement(withPlogMonthDay((m, d) => (m === 2 && d === 21) || m === 3 || m === 4 || (m === 5 && d < 21))),
  fallColor: _makeOneShotAchievement(withPlogMonthDay((m, d) => (m === 8 && d === 21) || m === 9 || m === 10 || (m === 11 && d < 21))),
  polarBear: _makeOneShotAchievement(withPlogMonthDay((m, d) => (m === 11 && d === 21) || m === 0 || m === 1 || (m === 2 && d < 21))),
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
 * @returns {{ achievements: UserAchievements, needInit: AchievementType[], completed: AchievementType[] }}
 */
function updateAchievements(achievements, newPlogs) {
  /** @type {AchievementType[]} */
  const names = Object.keys(AchievementHandlers);
  const needInit = [];
  const completed = [];

  const plogs = Array.isArray(newPlogs) ? newPlogs : [newPlogs];
  for (const plog of plogs) {
    const {DateTime, TZ = 240} = plog;
    plog.LocalDate = new Date(DateTime.toMillis() - TZ*60000);
  }

  // Loop through all achievement types...
  const updatedAchievements = names.reduce((updated, name) => {
    // ...checking the user's current progress toward that achievement...
    let current = updated && updated[name];
    const handler = AchievementHandlers[name];

    if (!current) {
      // ...or initializing the achievement progress if necessary
      needInit.push(name);
      current = { ...handler.initial };
    } else if (current.completed)
      // skip over completed achievements
      return updated;

    try {
      for (const plog of plogs) {
        current = handler.update(current, plog);

        if (current.completed) {
          completed.push(name);
          break;
        }
      }

      return Object.assign(
        updated || {},
        { [name]: current }
      );
    } catch (err) {
      console.error(`error updating '${name}' achievement`, err);
      return updated;
    }
  }, achievements);

  return {
    achievements: updatedAchievements,
    completed,
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
 * @property {string} [profilePicture]
 * @property {string} displayName
 */

/**
 * @param {UserData['stats']} stats
 * @param {PlogData} plog
 * @param {number} [bonusMinutes]
 */
function updateStats(stats, plog, bonusMinutes=0) {
  if (!stats) stats = {};

  const date = localPlogDate(plog);
  for (let {unit, when} of timeUnits) {
    const whenValue = when(date);
    let unitStats = stats[unit];
    if (!unitStats || unitStats.whenID !== whenValue) {
      stats[unit] = unitStats = { milliseconds: 0, count: 0, whenID: whenValue };
    }

    unitStats.milliseconds += plog.PlogDuration || 0;
    unitStats.count += 1;
    unitStats.bonusMinutes = bonusMinutes;
  }

  return stats;
}

/**
 * @param {AchievementType[]} achievements
 * @returns {number}
 */
function calculateBonusMinutes(achievements) {
  return achievements.reduce((total, type) => AchievementHandlers[type].points+total, 0);
}

module.exports = {
  AchievementHandlers,
  timeUnits,
  localPlogDate,
  calculateBonusMinutes,
  updateAchievements,
  updateAchievementsLocal,
  updateStats,
};
