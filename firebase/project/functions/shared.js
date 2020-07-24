/**
 *  The code in this file is shared between the client and server. They should
 *  therefore no rely on any environment-specific 'machinery' (e.g., access to
 *  the database) being available.
 */

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

/** @typedef {import('geofirestore-core').GeoFirestoreTypes.GeoDocumentData} GeoDocumentData */
/** @typedef {import('../../plogs.js').PlogData & GeoDocumentData} PlogData */
/** @typedef {PlogData & { id: string }} PlogDataWithId */
/** @typedef {PlogData & { id: string, LocalDate: Date }} ExtendedPlogData */

/** @typedef {import('../../regions.js').Region} Region */
/** @typedef {{ ids: string[], data: any }} RecentPlogs */
/** @typedef {Omit<Region, 'recentPlogs'> & { recentPlogs: RecentPlogs }} RegionData */

/**
  * @typedef {{ completed: Timestamp, updated: Timestamp, refID: string } & { [k in PropertyKey ]: any}} AchievementData
  */
/**
 * @typedef {Object} AchievementHandler
 * @property {AchievementData} initial
 * @property {(previous: AchievementData, plog: ExtendedPlogData, region: RegionData) => AchievementData} update
 * @property {(left: AchievementData, right: AchievementData) => Partial<AchievementData>} [merge]
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

const min = (a, b) => a <= b ? a : b;
const max = (a, b) => a >= b ? a : b;

const newest = (a, b) => a ? (b ? max(a, b) : a) : b;
const oldest = (a, b) => a ? (b ? min(a, b) : a) : b;

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
      count: 0,
      refID: null
    },
    update(previous, plog) {
      const {count = 0} = previous;
      const completed = count + 1 >= target ? plog.DateTime : null;

      return {
        completed,
        updated: plog.DateTime,
        count: count + 1,
        refID: completed ? plog.id : null
      };
    },
    merge(left, right) {
      return {
        count: (left.count || 0) + (right.count || 0)
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
    refID: null,
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
            changes.refID = plog.id;
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
    },
    merge(left, right) {
      return {
        streak: max(left.streak, right.streak),
        longestStreak: max(left.longestStreak, right.longestStreak),
        streakLost: newest(left.streakLost, right.streakLost)
      };
    }
  };
}

/**
 * Creates a handler for an achievement that is completed the first time a plog
 * satisfies the predicate function `pred`;
 *
 * @param {(plog: ExtendedPlogData) => any} pred
 * @param {number} [points=50]
 * @returns {AchievementHandler}
 */
const _makeOneShotAchievement = (pred, points=50) => ({
  initial: { completed: null, refID: null },
  points,
  update: (previous, plog) =>  pred(plog) ? { completed: plog.DateTime, refID: plog.id } : previous
});

/** @type {AchievementHandler} */
const BreakTheSealAchievement = {
  initial: { completed: null, refID: null },
  points: 100,
  update: (previous, plog, region) => {
    if (region && region.recentPlogs.ids.length === 1) {
      return { completed: plog.DateTime, refID: plog.id };
    }

    return previous;
  }
};

const withPlogMonthDay = fn => (({LocalDate}) => fn(LocalDate.getMonth(), LocalDate.getDate()));

// Full list of achievements:
// https://airtable.com/shrHq1EmZzFO7hiQe/tblbArS3zXcLPwdbm/viw9Jk1OkBKdN5Iwc?blocks=bip681nyUrUqlzD8e

// Many achievements can be calculated using information on the plog and
// previous achievement data:
//   First Plog, Team Effort, True Native, Bug Zapper, Danger Pay, Daredevil,
//   100 Club, Dog Days, Spring Chicken, Fall Color, Polar Bear, Plog Away, 1000
//   club, Streaker, Dog's Best Friend, Marathoner, Take A Hike, Water Sports,
//   Babysitter, Twofer, No Butts

// Some achievements also use local aggregates calculated on regions:
//   Break the Seal, Busy Bee (not enabled yet)

// The general approach will also work for these, once we assign geo labels to
// plogs:
//   Ranger, City Slicker, Nature Child, Street Cred, Oceanographer

// This has to be triggered by an invite:
//   Pay it Forward

const AchievementHandlers = {
  ['firstPlog']: _makeCountAchievement(1, 50),
  ['100Club']: _makeCountAchievement(100, 1000),
  ['1000Club']: _makeCountAchievement(1000, 10000),
  streaker: _makeStreakHandler(7, 250),
  teamEffort: _makeOneShotAchievement(plog => plog.HelperType === 'team', 20),
  dogsBestFriend: _makeOneShotAchievement(plog => plog.HelperType === 'dog', 20),
  babysitter: _makeOneShotAchievement(plog => plog.HelperType === 'teacher', 20),
  twofer: _makeOneShotAchievement(plog => plog.HelperType === 'friend', 20),
  bugZapper: _makeOneShotAchievement(
    plog => (plog.TrashTypes||[]).includes('standing_water'), 20),
  dangerPay: _makeOneShotAchievement(
    plog => (plog.TrashTypes||[]).find(type => type.match(/^glass|standing_water$/)), 20),
  trueNative: _makeOneShotAchievement(plog => (plog.TrashTypes||[]).includes('invasive_plants')),
  noButts: _makeOneShotAchievement(plog => (plog.TrashTypes||[]).includes('cigarette_butts')),
  daredevil: _makeOneShotAchievement(plog => plog.ActivityType === 'biking', 20),
  marathoner: _makeOneShotAchievement(plog => plog.ActivityType === 'running', 20),
  takeAHike: _makeOneShotAchievement(plog => plog.ActivityType === 'hiking', 20),

  dogDays: _makeOneShotAchievement(withPlogMonthDay((m, d) => (m === 5 && d === 21) || m === 6 || m === 7 || (m === 8 && d < 21))),
  springChicken: _makeOneShotAchievement(withPlogMonthDay((m, d) => (m === 2 && d === 21) || m === 3 || m === 4 || (m === 5 && d < 21))),
  fallColor: _makeOneShotAchievement(withPlogMonthDay((m, d) => (m === 8 && d === 21) || m === 9 || m === 10 || (m === 11 && d < 21))),
  polarBear: _makeOneShotAchievement(withPlogMonthDay((m, d) => (m === 11 && d === 21) || m === 0 || m === 1 || (m === 2 && d < 21))),

  breakTheSeal: BreakTheSealAchievement,
};

/** @typedef {keyof typeof AchievementHandlers} AchievementType */

/** @typedef {{ [k in AchievementType]?: AchievementData }} UserAchievements */

/**
 * Updates a user's achievements. Returns the updated achievements and an array
 * of achievement types that have not yet been initialized.
 *
 * @param {UserAchievements} achievements
 * @param {PlogData|PlogData[]} newPlogs
 * @param {RegionData} [region]
 *
 * @returns {{ achievements: UserAchievements, needInit: AchievementType[], completed: AchievementType[] }}
 */
function updateAchievements(achievements, newPlogs, region) {
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
        current = handler.update(current, plog, region);

        if (current.completed) {
          completed.push(name);
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
 * @param {UserAchievements} achievementsA
 * @param {UserAchievements} achievementsB
 *
 * @returns {UserAchievements}
 */
function mergeAchievements(achievementsA, achievementsB) {
  if (!achievementsB) return achievementsA;
  if (!achievementsA) return achievementsB;

  const merged = {};
  const names = /** @type {AchievementType[]} */(Object.keys(AchievementHandlers));

  for (const name of names) {
    const a = achievementsA[name];
    const b = achievementsB[name];

    if (!(a && b)) {
      merged[name] = a || b;
      continue;
    }

    // Choose the one that has completed the achievement. If that's both, choose
    // the one that was completed first.
    if (a.completed) {
      merged[name] = b.completed ? (a.completed <= b.completed ? a : b) : a;
    } else if (b.completed) {
      merged[name] = b;
    } else {
      // Only call the 'merge' function if neither a nor b has completed the
      // achievement
      const fn = AchievementHandlers[name].merge;
      const shared = {
        updated: newest(a.updated, b.updated),
        completed: null
      };
      merged[name] = Object.assign(shared, fn ? fn(a, b) : a);
    }
  }

  return merged;
}

/**
 * Records aggregated stats for a particular time unit
 *
 * @typedef {object} PlogStats
 * @property {string} whenID - used as an identifier for the unit on which the
 *   stats are aggregated. E.g., if the user's most recent plog is on 4/3/21,
 *   the year PlogStats would have a `whenID` value of `2021` and the `month`
 *   PlogStats would have a `whenID` value of `2021-04`.
 * @property {number} milliseconds - total time plogged during this time period
 * @property {number} count
 */

/** @typedef {Omit<PlogStats, 'whenID'>} UserPlogStatsForRegion */
/** @typedef {{ [k in string]: UserPlogStatsForRegion }} PlogStatsByRegion */
/** @typedef {PlogStats & { region: PlogStatsByRegion, bonusMinutes?: number }} UserPlogStats */
/** @typedef {'month' | 'year' | 'total'} TimeUnit */

/**
 * Caches general stats about usage, including aggregates for the month and year
 * of the most recent plog.
 *
 * @typedef {{ [k in TimeUnit]: PlogStats }} CollectedPlogStats
 */
/** @typedef {CollectedPlogStats} RegionStats */
/** @typedef {{ [k in TimeUnit]: UserPlogStats }} UserStats */

/** @typedef {{ unit: TimeUnit, when: (dt: Date) => string }} TimeUnitConfig */

const _zpad = n => `${n < 10 ? '0': ''}${n}`;

/// Within a given time unit, the typographic ordering of whenIDs should
/// preserve the natural order

/** @type {TimeUnitConfig[]} */
const timeUnits = [
  { unit: 'month', when: dt => `${dt.getFullYear()}-${_zpad(dt.getMonth()+1)}` },
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
 * @param {UserStats|RegionStats} stats
 * @param {Date} date
 * @param {(stats: UserPlogStats|PlogStats) => void} fn
 */
function withStats(stats, date, fn) {
  if (!stats) stats = {};

  for (let {unit, when} of timeUnits) {
    const whenValue = when(date);
    let unitStats = stats[unit];
    if (!unitStats || unitStats.whenID !== whenValue) {
      stats[unit] = unitStats = { milliseconds: 0, count: 0, whenID: whenValue };
    }

    fn(unitStats);
  }

  return stats;
}

/**
 * @param {UserStats|RegionStats} stats
 * @param {PlogData} plog
 * @param {number} [bonusMinutes]
 * @param {string} [regionID]
 */
function updateStats(stats, plog, bonusMinutes=0, regionID=null) {
  return withStats(stats, localPlogDate(plog), unitStats => {
    unitStats.milliseconds += plog.PlogDuration || 0;
    unitStats.count += 1;
    unitStats.bonusMinutes = bonusMinutes;

    if (regionID) {
      if (!unitStats.region)
        unitStats.region = {};
      if (!unitStats.region[regionID])
        unitStats.region[regionID] = { milliseconds: 0, count: 0 };
      unitStats.region[regionID].milliseconds += plog.PlogDuration || 0;
      unitStats.region[regionID].count += 1;
    }
  });
}

/**
 * @param {UserStats|RegionStats} stats
 * @param {Date} date
 * @param {number} bonusMinutes
 */
function addBonusMinutes(stats, date, bonusMinutes) {
  return withStats(stats, date, unitStats => {
    unitStats.bonusMinutes += bonusMinutes;
  });
}

/**
 * @param {UserStats} statsA
 * @param {UserStats} statsB
 */
function mergeStats(statsA, statsB) {
  /** @type {UserStats} */
  const merged = {};
  for (let {unit} of timeUnits) {
    const fromUnitStats = statsA[unit];
    const toUnitStats = statsB[unit];

    if (!toUnitStats)
      merged[unit] = fromUnitStats;
    if (!fromUnitStats)
      merged[unit] = toUnitStats;

    if (fromUnitStats.whenID === toUnitStats.whenID) {
      merged[unit] = {
        whenID: fromUnitStats.whenID,
        milliseconds: fromUnitStats.milliseconds + toUnitStats.milliseconds,
        count: fromUnitStats.count + toUnitStats.count,
        region: Object.keys(toUnitStats.region || {}).reduce(
          (rs, regionId) => {
            if (rs[regionId]) {
              rs[regionId].count += toUnitStats.region[regionId].count;
              rs[regionId].milliseconds += toUnitStats.region[regionId].milliseconds;
            } else {
              rs[regionId] = toUnitStats.region[regionId];
            }
            return rs;
          }, fromUnitStats.region || {})
      };
      continue;
    }

    /// Relies on the typographic ordering of whenID preserving the
    /// chronological ordering of the underlying date
    merged[unit] = fromUnitStats.whenID > toUnitStats.whenID ? fromUnitStats : toUnitStats;
  }

  return merged;
}

/**
 * @param {AchievementType[]} achievements
 * @returns {number}
 */
function calculateBonusMinutes(achievements) {
  return achievements.reduce((total, type) => AchievementHandlers[type].points+total, 0);
}

/// REGIONS ///

/**
 * @param {RecentPlogs} recentPlogs
 * @param {PlogDataWithId} plogData
 */
function addPlogToRecents(recentPlogs, plogData, maxLength=20) {
  if (!recentPlogs)
    recentPlogs = { ids: [], data: {} };
  if (recentPlogs.ids.push(plogData.id) > maxLength) {
    for (const plogID of recentPlogs.ids.slice(maxLength-1))
      delete recentPlogs.data[plogID];

    recentPlogs.ids = recentPlogs.ids.slice(0, maxLength);
  }
  recentPlogs.data[plogData.id] = {
    id: plogData.id,
    when: plogData.DateTime,
    userID: plogData.UserID
  };
  return recentPlogs;
}

/**
 * @param {RegionData} regionData
 * @param {PlogDataWithId} plogData
 * @param {UserPlogStatsForRegion} plogStats
 *
 * @returns {Partial<RegionData>}
 */
function addPlogToRegion(regionData, plogData, plogStats) {
  return {
    recentPlogs: addPlogToRecents(regionData.recentPlogs, plogData),
    stats: updateStats(regionData.stats, plogData),
    leaderboard: updateLeaderboard(regionData.leaderboard, plogData.UserID, plogStats)
  };
}

/**
 * @template T, S
 * @param {T[]} sorted
 * @param {S} score
 * @param {(item: T) => S} scoreFn
 */
function findPosition(sorted, score, scoreFn, n=20) {
  let i = sorted.length;
  while (i > 0 && score > scoreFn(sorted[i-1]))
    i--;

  return i < n ? i : null;
}

/**
 * @param {Region["leaderboard"]} leaders
 * @param {string} userID
 * @param {PlogStats} stats
 */
function updateLeaderboard(leaders, userID, stats, n=20) {
  leaders = Object.assign({ ids: [], data: {} }, leaders);

  const position = findPosition(leaders.ids, stats.count,
                                (uid => leaders.data[uid].count), n);
  if (position === null)
    return {};

  // Update the user data
  leaders.data[userID] = Object.assign({}, leaders.data[userID], stats);

  let previous = leaders.data[userID] && leaders.ids.indexOf(userID);
  if (previous === position)
    return leaders;

  /// Update the ranking
  // Insert the user ID at its new position
  leaders.ids.splice(position, 0, userID);

  if (previous >= 0) {
    // And remove it from its previous position
    // It may be safe to assume that the position will only decrease, but to be
    // safe, let's handle either case.
    leaders.ids.splice(previous + (previous > position), 1);
  } else {
    while (leaders.ids.length > n) {
      const deleteID = leaders.ids.pop();
      delete leaders.data[deleteID];
    }
  }

  return leaders;
}

module.exports = {
  AchievementHandlers,
  timeUnits,
  localPlogDate,
  calculateBonusMinutes,
  mergeAchievements,
  mergeStats,
  updateAchievements,
  updateStats,
  addBonusMinutes,

  addPlogToRegion,
  updateLeaderboard,
};
