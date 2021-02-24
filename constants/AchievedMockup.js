import * as React from 'react';

import { AchievementHandlers } from '../firebase/project/functions/shared';
import { pluralize } from '../util/string';

import Umbrella from '../assets/svg/achievement_badges_48_48/baseline-beach_access-48px.svg';
import SingleCheckmark from '../assets/svg/achievement_badges_48_48/baseline-done_outline-48px.svg';
import Team from '../assets/svg/achievement_badges_24_24/groups-24px.svg';
import Compass from '../assets/svg/achievement_badges_48_48/baseline-explore-48px.svg';
import TrafficLight from '../assets/svg/achievement_badges_48_48/baseline-traffic-48px.svg';
import Globe from '../assets/svg/achievement_badges_48_48/baseline-language-48px.svg';
import FlowerBud from '../assets/svg/achievement_badges_24_24/local_florist-24px.svg';
import Syringe from '../assets/svg/achievement_badges_48_48/syringe_48.svg';
import Bike from '../assets/svg/achievement_badges_48_48/04-Activities-bike-015-bike_48.svg';
import DoubleCheckmark from '../assets/svg/achievement_badges_48_48/baseline-done_all-48px.svg';
import Mosquito from '../assets/svg/achievement_badges_48_48/mosquito_48.svg';
import TourMap from '../assets/svg/achievement_badges_48_48/baseline-map-48px.svg';
import Waterpolo from '../assets/svg/achievement_badges_48_48/017-waterpolo_48.svg';
import Home from '../assets/svg/achievement_badges_48_48/baseline-home-48px.svg';
import DogWalking from '../assets/svg/achievement_badges_48_48/man-carrying-a-dog-with-a-belt-to-walk_48.svg';
import Chicken from '../assets/svg/achievement_badges_48_48/hen_48.svg';
import Leaves from '../assets/svg/achievement_badges_24_24/eco-24px.svg';
import Bear from '../assets/svg/achievement_badges_48_48/polar-bear_48.svg';
import Face from '../assets/svg/achievement_badges_48_48/baseline-face-48px.svg';
import Airplane from '../assets/svg/achievement_badges_48_48/baseline-flight_land-48px.svg';
import Star from '../assets/svg/achievement_badges_48_48/baseline-grade-48px.svg';
import MetalHand from '../assets/svg/achievement_badges_48_48/024-concert.svg';

import icons from '../icons';

import dogsBestFriend from '../assets/svg/achievement_badges_24_24/pets-24px.svg';
import babysitter from '../assets/svg/achievement_badges_24_24/child_care-24px.svg';
import takeAHike from '../assets/svg/achievement_badges_24_24/backpack-24px.svg';
import streaker from '../assets/svg/achievement_badges_24_24/emoji_people-24px.svg';
import marathoner from '../assets/svg/achievement_badges_24_24/directions_run-24px';
import waterSports from '../assets/svg/achievement_badges_24_24/rowing-24px.svg';
import twofer from '../assets/svg/achievement_badges_24_24/looks_two-24px.svg';
import noButts from '../assets/svg/achievement_badges_24_24/smoke_free-24px.svg';
import breakTheSeal from '../assets/svg/achievement_badges_24_24/house-24px.svg';
import hotToTrot from '../assets/svg/achievement_badges_24_24/horse-face.svg';
import kittyCorner from '../assets/svg/achievement_badges_24_24/cat-face.svg';
import adoptAHighwayForDriving from '../assets/svg/achievement_badges_24_24/road-with-broken-line.svg';
import evilKnievelForMotorbiking from '../assets/svg/achievement_badges_24_24/motorbike-helmet.svg';
import snowflakeForWinterSports from '../assets/svg/achievement_badges_24_24/snowflake.svg';
import beachBum from '../assets/svg/achievement_badges_24_24/beach_access-24px.svg';
import halloween from '../assets/svg/achievement_badges_24_24/halloween.svg';
import holidays from '../assets/svg/achievement_badges_24_24/holly-leaves-with-berries.svg';
import partyHat from '../assets/svg/achievement_badges_24_24/party-hat.svg';
import earlyBird from '../assets/svg/achievement_badges_24_24/early-bird.svg';
import nightOwl from '../assets/svg/achievement_badges_24_24/owl.svg';
import turkey from '../assets/svg/achievement_badges_24_24/turkey.svg';


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
    icon: streaker,
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
    icon: Mosquito,
    description: 'Removed standing water',
    incompleteDescription: 'Remove standing water',
  },
  dangerPay: {
    badgeTheme: 'Metal Head',
    icon: MetalHand,
    description: 'Plogged metal or junk',
    incompleteDescription: 'Plog metal or junk',
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
    icon: dogsBestFriend,
    description: 'Plogged with your dog',
    incompleteDescription: 'Plog with your dog',
  },
  babysitter: {
    badgeTheme: 'Babysitter',
    icon: babysitter,
    description: 'Plogged with a kid',
    incompleteDescription: 'Plog with a kid',
  },
  twofer: {
    badgeTheme: 'Twofer',
    icon: twofer,
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
    icon: noButts,
    description: 'Cleaned up cigarette butts',
    incompleteDescription: 'Clean up cigarette butts',
  },
  marathoner: {
    badgeTheme: 'Marathoner',
    icon: marathoner,
    description: 'Plogged while jogging',
    incompleteDescription: 'Plog while jogging',
  },
  takeAHike: {
    badgeTheme: 'Take a Hike',
    icon: takeAHike,
    description: 'Plogged while hiking',
    incompleteDescription: 'Plog while hiking',
  },
  breakTheSeal: {
    badgeTheme: 'Break the Seal',
    icon: breakTheSeal,
    description: 'You were the first plogger in the neighborhood',
    incompleteDescription: 'Be the first plogger in the neighborhood',
  },
  waterSports: {
    badgeTheme: 'Water Sports',
    icon: waterSports,
    description: 'Plogged on the water',
    incompleteDescription: 'Plog on the water',
  },
  hotToTrot: {
    badgeTheme: 'Hot to Trot',
    icon: hotToTrot,
    description: 'Plogged on horseback',
    incompleteDescription: 'Plog on horseback',
  },
  kittyCorner: {
    badgeTheme: 'Kitty Corner',
    icon: kittyCorner,
    description: 'Plogged with your cat',
    incompleteDescription: 'Plog with your cat',
  },
  adoptAHighwayForDriving: {
    badgeTheme: 'Adopt a Highway',
    icon: adoptAHighwayForDriving,
    description: 'Plogged while driving',
    incompleteDescription: 'Plog while driving',
  },
  evilKnievelForMotorbiking: {
    badgeTheme: 'Evil Knievel',
    icon: evilKnievelForMotorbiking,
    description: 'Plogged while motorbiking',
    incompleteDescription: 'Plog while motorbiking',
  },
  snowflakeForWinterSports: {
    badgeTheme: 'Snowflake',
    icon: snowflakeForWinterSports,
    description: 'Plogged while doing winter sports',
    incompleteDescription: 'Plog while doing winter sports',
  },
  beachBum: {
    badgeTheme: 'Beach Bum',
    icon: beachBum,
    description: 'Plogged a beach',
    incompleteDescription: 'Plog a beach',
  },
  boo: {
    badgeTheme: 'Boo!',
    icon: halloween,
    description: 'Plogged on Halloween',
    incompleteDescription: 'Plog on Halloween',
  },
  happyHolidays: {
    badgeTheme: 'Happy Holidays',
    icon: holidays,
    description: 'Plogged in December',
    incompleteDescription: 'Plog in December',
  },
  happyNewYear: {
    badgeTheme: 'Happy New Year',
    icon: partyHat,
    description: 'Plogged on January 1st',
    incompleteDescription: 'Plog on January 1st',
  },
  earlyBird: {
    badgeTheme: 'Early Bird',
    icon: earlyBird,
    description: 'Plogged in the morning',
    incompleteDescription: 'Plog in the morning',
  },
  nightOwl: {
    badgeTheme: 'Night Owl',
    icon: nightOwl,
    description: 'Plogged in the evening',
    incompleteDescription: 'Plog in the evening',
  },
  // plogTurkey: {
  //   badgeTheme: 'Plog Turkey',
  //   icon: turkey,
  //   description: 'Plogged on Thanksgiving',
  //   incompleteDescription: 'Plog on Thanksgiving',
  // },
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
