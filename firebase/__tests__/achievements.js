import { firestore } from 'firebase';

import { calculateBonusMinutes, updateAchievements, updateStats } from '../project/functions/shared';

const initialAchievements = {};

/** @type {(dt: Date) => Date} */
const incDay = (dt, days=1) => (new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()+days));

// /** @type {(dt: Date) => Date} */
// const incMonth = (dt, months=1) => (new Date(dt.getFullYear(), dt.getMonth()+months, dt.getDate()));

/** @type {(dt: Date) => firestore.Timestamp} */
const timestamp = dt => new firestore.Timestamp.fromDate(dt);

describe('', () => {
  const when = new Date(2021, 7, 15);
  const plog = {
    id: 'gfedcba87654321',
    TrashTypes: [],
    ActivityType: '',
    GeoLabel: 'plogs in space!',
    HelperType: '',
    PlogType: 'Plog',
    DateTime: timestamp(when),
    TZ: when.getTimezoneOffset(),
    UserID: 'abcdefg12345678',
    Photos: [],
    PlogDuration: 0,
    Public: true,
    UserProfilePicture: '',
    UserDisplayName: 'Test Plogger',
  };

  it('should handle one-shot achievements', () => {
    const { achievements, completed, needInit } = updateAchievements({}, plog);
    expect(completed).toContain('firstPlog');
    expect(completed).toContain('dogDays');

    for (const k of completed) {
      expect(achievements[k].completed.toDate()).toStrictEqual(when);
      expect(achievements[k].refID).toBe(plog.id);
    }

    for (const k of ['teamEffort', 'springChicken', 'fallColor', 'polarBear']) {
      expect(achievements[k]).toBe(null);
    }

    const bonus = calculateBonusMinutes(completed);
    expect(typeof bonus === 'number').toBeTruthy();
  });

  it('should correctly track streaks', () => {
    let { achievements } = updateAchievements({}, []);
    const when = new Date(2021, 7, 15);

    for (let i = 0; i < 7; ++i) {
      achievements = updateAchievements(achievements, { ...plog, DateTime: timestamp(incDay(when, i)) }).achievements;
      expect(achievements['streaker'].streak).toBe(i+1);
    }

    expect(achievements['streaker'].completed).toBeTruthy();
  });
});
