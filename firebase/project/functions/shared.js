/** @template T, S
 * @typedef {{ [K in keyof T]: T[K] extends S ? K : never }} WithValueType
 */
/** @template T, S
 * @typedef {keyof Pick<T, WithValueType<T, S>[keyof T]>} KeysWithValueType
 */

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
 * @property {object} achievements
 */

module.exports = {
  timeUnits
};
