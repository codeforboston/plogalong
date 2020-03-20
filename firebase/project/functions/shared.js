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
 * @returns {AchievementHandler}
 */
const _makeOneShotAchievement = pred => ({
  initial: { completed: null },
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
  ['firstPlog']: _makeCountAchievement(1),
  ['100Club']: _makeCountAchievement(100),
  ['1000Club']: _makeCountAchievement(1000),
  streaker: _makeStreakHandler(7),
  teamEffort: _makeOneShotAchievement(plog => plog.groupType === 'team'),
  bugZapper: _makeOneShotAchievement(
    plog => (plog.trashTypes||[]).includes('standing_water')),
  dangerPay: _makeOneShotAchievement(
    plog => (plog.trashTypes||[]).find(type => type.match(/^glass|standing_water$/))),
  daredevil: _makeOneShotAchievement(plog => plog.activityType === 'biking'),

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
 * @returns {{ achievements: UserAchievements, needInit: AchievementType[] }}
 */
function updateAchievements(achievements, newPlogs) {
  /** @type {AchievementType[]} */
  const names = Object.keys(AchievementHandlers);
  const needInit = [];

  const plogs = Array.isArray(newPlogs) ? newPlogs : [newPlogs];
  for (const plog of plogs) {
    const {DateTime, TZ = 240} = plog;
    plog.LocalDate = new Date(DateTime.toMillis() - TZ*60000);
  }

  const updatedAchievements = names.reduce((updated, name) => {
    const current = updated && updated[name];
    const handler = AchievementHandlers[name];

    if (!current)
      needInit.push(name);
    else if (current.completed)
      return updated;

    try {
      return Object.assign(
        updated || {},
        { [name]: plogs.reduce(handler.update, current || { ...handler.initial }) }
      );
    } catch (err) {
      console.error(`error updating '${name}' achievement`, err);
      return updated;
    }
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
