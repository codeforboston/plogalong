import * as React from 'react';

import { AchievementHandlers } from '../firebase/project/functions/shared';
import { pluralize } from '../util';

import Umbrella from '../assets/svg/achievement_badges_48_48/baseline-beach_access-48px.svg';
import SingleCheckmark from '../assets/svg/achievement_badges_48_48/baseline-done_outline-48px.svg';
import Team from '../assets/svg/achievement_badges_48_48/011-team-leader_48.svg';
import Compass from '../assets/svg/achievement_badges_48_48/baseline-explore-48px.svg';
import TrafficLight from '../assets/svg/achievement_badges_48_48/baseline-traffic-48px.svg';
import Globe from '../assets/svg/achievement_badges_48_48/baseline-language-48px.svg';
import FlowerBud from '../assets/svg/achievement_badges_48_48/baseline-spa-48px.svg';
import Syringe from '../assets/svg/achievement_badges_48_48/syringe_48.svg';
import Bike from '../assets/svg/achievement_badges_48_48/04-Activities-bike-015-bike_48.svg';
import DoubleCheckmark from '../assets/svg/achievement_badges_48_48/baseline-done_all-48px.svg';
import Flower from '../assets/svg/achievement_badges_48_48/baseline-local_florist-48px.svg';
import TourMap from '../assets/svg/achievement_badges_48_48/baseline-map-48px.svg';
import Waterpolo from '../assets/svg/achievement_badges_48_48/017-waterpolo_48.svg';
import Home from '../assets/svg/achievement_badges_48_48/baseline-home-48px.svg';
import DogWalking from '../assets/svg/achievement_badges_48_48/Helpers-02_48.svg';
import Chicken from '../assets/svg/achievement_badges_48_48/chicken-looking-right_48.svg';
import Leaves from '../assets/svg/achievement_badges_48_48/leaves_48.svg';
import Bear from '../assets/svg/achievement_badges_48_48/bear_48.svg';
import Face from '../assets/svg/achievement_badges_48_48/baseline-face-48px.svg';
import Airplane from '../assets/svg/achievement_badges_48_48/baseline-flight_land-48px.svg';
import Star from '../assets/svg/achievement_badges_48_48/baseline-grade-48px.svg';

import icons from '../icons';


/** @typedef {import('../firebase/project/functions/shared').UserAchievements} UserAchievements */

/** @typedef {number} UserAchievements["streaker"]["streak"] */

/**
 * @template {keyof UserAchievements} K
 * @typedef {object} AchievementType
 * @property {string} badgeTheme Descriptive name of the achievement
 * @property {React.Component} icon
 * @property {string | (achievement: UserAchievements[K]) => string} [detailText]
 * @property {(achievement: UserAchievements[K]) => number} [progress]
 * @property {(achievements: UserAchievements) => boolean} [hide]
 * @property {string} description Description for completed achievement
 * @property {string} incompleteDescription Description for incomplete achievement
 */

/** @type {{ [K in keyof UserAchievements]: AchievementType<K> }} */
const AchievementTypes = {
  ['firstPlog']: {
    badgeTheme: 'First Plog',
    icon: SingleCheckmark,
    description: 'First step is the hardest',
    incompleteDescription: 'Log your first plog',
  },
  ['100Club']: {
    badgeTheme: '100 Club',
    icon: DoubleCheckmark,
    detailText: ({count}) => `${count}/100`,
    progress: ({count}) => (count || 0)/100,
    description: 'Logged 100 plogs',
    incompleteDescription: 'Log 100 plogs',
  },
  ['1000Club']: {
    badgeTheme: '1000 Club',
    icon: Star,
    detailText: ({count}) => `${count}/1000`,
    progress: ({count}) => (count || 0)/1000,
    hide: ({ '100Club': hundred }) => !(hundred && hundred.completed),
    description: 'Logged 1000 plogs',
    incompleteDescription: 'Log 1000 plogs',
  },
  streaker: {
    badgeTheme: 'Streaker',
    icon: Star,
    detailText: ({complete, streak}) => complete ? '' : `${pluralize(streak, 'day')} down, ${7-streak} to go`,
    progress: ({streak}) => (streak || 0)/7,
    hide: ({ streaker: { updated, streak }}) => streak < 2,
    description: 'Plogged 7 days in a row',
    incompleteDescription: 'Plog 7 days in a row',
  },
  teamEffort: {
    badgeTheme: 'Team Effort',
    icon: Team,
    description: 'You did it together',
    incompleteDescription: 'Plog in a group',
  },
  bugZapper: {
    badgeTheme: 'Bug Zapper',
    icon: Flower,
    description: 'Removed standing water',
    incompleteDescription: 'Remove standing water',
  },
  dangerPay: {
    badgeTheme: 'Danger Pay',
    icon: Syringe,
    description: 'Plogged shards or glass',
    incompleteDescription: 'Plog shards or glass',
  },
  daredevil: {
    badgeTheme: 'Daredevil',
    icon: Bike,
    description: 'Plogged while cycling',
    incompleteDescription: 'Plog while cycling',
  },
  dogDays: {
    badgeTheme: 'Dog Days',
    icon: DogWalking,
    description: 'First plog of the summer',
    incompleteDescription: 'Log your first summer plog',
  },
  springChicken: {
    badgeTheme: 'Spring Chicken',
    icon: Chicken,
    description: 'First plog of the spring',
    incompleteDescription: 'Log your first spring plog',
  },
  fallColor: {
    badgeTheme: 'Fall Color',
    icon: Leaves,
    description: 'First plog of the fall',
    incompleteDescription: 'Log your first fall plog',
  },
  polarBear: {
    badgeTheme: 'Polar Bear',
    icon: Bear,
    description: 'First plog of the winter',
    incompleteDescription: 'Log your first winter plog',
  },

  dogsBestFriend: {
    badgeTheme: "Dog's Best Friend",
    icon: DogWalking,
    description: 'Plogged with your dog',
    incompleteDescription: 'Plog with your dog',
  },
  babysitter: {
    badgeTheme: 'Babysitter',
    icon: icons.Teacher,
    description: 'Plogged with a kid',
    incompleteDescription: 'Plog with a kid',
  },
  twofer: {
    badgeTheme: 'Twofer',
    icon: icons.Couple,
    description: 'Plogged with a friend or partner',
    incompleteDescription: 'Plog with a friend or partner',
  },
  trueNative: {
    badgeTheme: 'True Native',
    icon: FlowerBud,
    description: 'Removed invasive species',
    incompleteDescription: 'Remove invasive species',
  },
  noButts: {
    badgeTheme: 'No Butts',
    icon: SingleCheckmark,
    description: 'Cleaned up cigarette butts',
    incompleteDescription: 'Clean up cigarette butts',
  },
  marathoner: {
    badgeTheme: 'Marathoner',
    icon: icons.Running,
    description: 'Plogged while jogging',
    incompleteDescription: 'Plog while jogging',
  },
  takeAHike: {
    badgeTheme: 'Take a Hike',
    icon: icons.Backpacker,
    description: 'Plogged while hiking',
    incompleteDescription: 'Plog while hiking',
  },
  breakTheSeal: {
    badgeTheme: 'Break the Seal',
    icon: SingleCheckmark,
    description: 'You were the first plogger in the neighborhood',
    incompleteDescription: 'Be the first plogger in the neighborhood',
  },
};


/// Add in config options shared with the backend:
for (const k in AchievementTypes) {
  const handler = AchievementHandlers[k];

  if (!handler) continue;

  Object.assign(AchievementTypes[k], {
    points: handler.points
  });
}

export default AchievementTypes;
