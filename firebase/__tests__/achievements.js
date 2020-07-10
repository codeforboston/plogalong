import { firestore } from 'firebase';

import { updateAchievements } from '../project/functions/shared';

const initialAchievements = {};

describe('', () => {
  const when = new Date(2021, 7, 15);
  const plog = {
    id: 'gfedcba87654321',
    TrashTypes: [],
    ActivityType: '',
    GeoLabel: 'plogs in space!',
    HelperType: '',
    PlogType: 'Plog',
    DateTime: new firestore.Timestamp.fromDate(when),
    TZ: when.getTimezoneOffset(),
    UserID: 'abcdefg12345678',
    Photos: [],
    PlogDuration: 0,
    Public: true,
    UserProfilePicture: '',
    UserDisplayName: 'Test Plogger',
  };

  it('', () => {
    const { achievements, completed, needInit } = updateAchievements(initialAchievements, plog);
    expect(completed).toContain('firstPlog');
    expect(completed).toContain('dogDays');

    for (const k of completed) {
      expect(achievements[k].completed.toDate()).toStrictEqual(when);
      expect(achievements[k].refID).toBe(plog.id);
    }
  });
});
