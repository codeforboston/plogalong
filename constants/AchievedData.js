import React from 'react';

import Options, {trashTypes} from './Options';

import Umbrella from '../assets/svg/baseline-beach_access-24px.svg';
import SingleCheckmark from '../assets/svg/baseline-done_outline-24px.svg';
import Team from '../assets/svg/011-team-leader.svg';
import Compass from '../assets/svg/baseline-explore-24px.svg';
import TrafficLight from '../assets/svg/baseline-traffic-24px.svg';
import Globe from '../assets/svg/baseline-language-24px.svg';
import FlowerBud from '../assets/svg/baseline-spa-24px.svg';
import Syringe from '../assets/svg/syringe.svg';
import Bike from '../assets/svg/04-Activities-bike-015-bike.svg';
import DoubleCheckmark from '../assets/svg/baseline-done_all-24px.svg';
import Flower from '../assets/svg/baseline-local_florist-24px.svg';
import TourMap from '../assets/svg/baseline-map-24px.svg';
import Waterpolo from '../assets/svg/017-waterpolo.svg';
import Home from '../assets/svg/baseline-home-24px.svg';
import DogWalking from '../assets/svg/Helpers-02.svg';
import Chicken from '../assets/svg/chicken-looking-right.svg';
import Leaves from '../assets/svg/leaves.svg';
import Bear from '../assets/svg/bear.svg';
import Face from '../assets/svg/baseline-face-24px.svg';
import Airplane from '../assets/svg/baseline-flight_land-24px.svg';
import Star from '../assets/svg/baseline-grade-24px.svg';
//import AchievementBadge from '../components/AchievementBadge';

let possibleBadges = {
    badge0:  { id: 0, key: "Beach Bum", pic: Umbrella, type: "", date: "", points: "10", minutes: "" },
    badge1:  { id: 1, key: "First Plog", pic: SingleCheckmark, type: "", date: "", points: "50", minutes: "" },
    badge2:  { id: 2, key: "Team Effort", pic: Team, type: "", date: "", points: "20", minutes: "" },
    badge3:  { id: 3, key: "Ranger", pic: Compass, type: "", date: "", points: "10", minutes: "" },
    badge4:  { id: 4, key: "City Slicker", pic: TrafficLight, type: "", date: "", points: "10", minutes: "" },
    badge5:  { id: 5, key: "True Native", pic: Globe, type: "", date: "", points: "20", minutes: "" },
    badge6:  { id: 6, key: "Bug Zapper", pic: FlowerBud, type: "", date: "", points: "20", minutes: "" },
    badge7:  { id: 7, key: "Danger Pay", pic: Syringe, type: "",  date: "", points: "20", minutes: "" },
    badge8:  { id: 8, key: "Daredevil", pic: Bike, type: "", date: "", points: "20", minutes: "" },
    badge9:  { id: 9, key: "100 Club", pic: DoubleCheckmark, type: "", date: "", points: "1000", minutes: "" },
    badge10: { id: 10, key: "Busy Bee", pic: Globe, type: "", date: "", points: "50", minutes: "" },
    badge11: { id: 11, key: "Nature Child", pic: Flower, type: "", date: "", points: "100", minutes: "" },
    badge12: { id: 12, key: "Street Cred", pic: TourMap, type: "", date: "", points: "100", minutes: "" },
    badge13: { id: 13, key: "Oceanographer", pic: Waterpolo, type: "", date: "", points: "100", minutes: "" },
    badge14: { id: 14, key: "Break the Seal", pic: Home, type: "", date: "", points: "100", minutes: "" },
    badge15: { id: 15, key: "Dog Days", pic: DogWalking, type: "", date: "", points: "50", minutes: "" },
    badge16: { id: 16, key: "Spring Chicken", pic: Chicken, type: "", date: "", points: "50", minutes: "" },
    badge17: { id: 17, key: "Fall Color", pic: Leaves, type: "", date: "", points: "50", minutes: "" },
    badge18: { id: 18, key: "Polar Bear", pic: Bear, type: "", date: "", points: "50", minutes: "" },
    badge19: { id: 19, key: "Pay it Forward", pic: Face, type: "", date: "", points: "50", minutes: "" },
    badge20: { id: 20, key: "Plog Away", pic: Airplane, type: "", date: "", points: "500", minutes: "" },
    badge21: { id: 21, key: "1000 Club", pic: Star, type: "", date: "", points: "10000", minutes: "" }
};

let usersPlogs = {
    userId: 'abcdefghijkl',
    key: 0,
    plogs: [
        {
            location: 'beach',
            trashTypes: ['recycling', 'glass', 'cigarette_butts'],
            timeSpentPlogging: 30,
            totalItemsPickedUp: 11,
            year: 2019,
            month: 9,
            day: 1
        },
        {
            location: 'beach',
            trashTypes: ['recycling', 'plastic_bags', 'cigarette_butts'],
            timeSpentPlogging: 25,
            totalItemsPickedUp: 8,
            year: 2019,
            month: 9,
            day: 4
        },
        {
            location: 'beach',
            trashTypes: ['recycling', 'straws', 'glass', 'cigarette_butts'],
            timeSpentPlogging: 35,
            totalItemsPickedUp: 15,
            year: 2019,
            month: 9,
            day: 8
        },
        {
            location: 'park',
            trashTypes: ['recycling', 'glass','plastic_bags', 'bottles', 'cigarette_butts'],
            timeSpentPlogging: 30,
            totalItemsPickedUp: 9,
            year: 2019,
            month: 10,
            day: 2
        },
        {
            location: 'park',
            trashTypes: ['recycling', 'glass','needles', 'bottles'],
            timeSpentPlogging: 15,
            totalItemsPickedUp: 3,
            year: 2019,
            month: 11,
            day: 5
        },
    ]
};

let BannerData = {
    timesThisMonth: '',
    minutesThisMonth: '',
    badgesThisMonth: '',
    totalPlogs: '',
    totalMinutes: '',
    totalBadges: ''
};

const AchievedData = () => {
    //
}

//export function getAchievementType(key) {
//    return AchievedData.find(achievement => achievement.key === key)
//}

export default AchievedData;