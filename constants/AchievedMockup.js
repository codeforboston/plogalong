import React from 'react';

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

let AchievedMockup = [
    { 
        id: 0,  
        key: "beachBum_6",
        badgeTheme: "Beach Bum",
        pic: <Umbrella />, 
        type: "beachBum", 
        dateCompleted: "2019-07-01 19:15:00",  // the full date
        month: "7", // the month it was completed (here, August), to give a metric for:
                    // first-of-a-season plog ("Dog Days", etc);
                    // number of plogs in some current month, for <HistoryBanner />
        points: "10", 
        minutes: "25", // add 1 point per minute?
        progress: "6"   // (here, "6" is 6; count starts from 1, not 0)
                        // for 2 metrics:
                        // progress towards 100Club and 1000Club;
                        // how many times a plogger has done this achievement type
    },
    { id: 1, key: "firstPlog_1", badgeTheme: "First Plog", pic: <SingleCheckmark />, type: "firstPlog", dateCompleted: "2019-00-02 06:05:00", month: "0", points: "50", minutes: "30", progress: "1" }, // this also qualifies as "Polar Bear" and "Beach Bum progress: '1'", see lines 68-69
    //{ id: 2, key: "", badgeTheme: "Team Effort", pic: <Team />, type: "teamEffort", dateCompleted: "", month: "", points: "20", minutes: "", progress: "" },
    //{ id: 3, key: "", badgeTheme: "Ranger", pic: <Compass />, type: "ranger", dateCompleted: "", month: "", points: "10", minutes: "", progress: "" },
    //{ id: 4, key: "", badgeTheme: "City Slicker", pic: <TrafficLight />, type: "citySlicker", dateCompleted: "", month: "", points: "10", minutes: "", progress: "" },
    //{ id: 5, key: "", badgeTheme: "True Native", pic: <Globe />, type: "trueNative", dateCompleted: "", month: "", points: "20", minutes: "", progress: "" },
    //{ id: 6, key: "", badgeTheme: "Bug Zapper", pic: <FlowerBud />, type: "bugZapper", dateCompleted: "", month: "", points: "20", minutes: "", progress: "" },
    { id: 7, key: "dangerPay_1", badgeTheme: "Danger Pay", pic: <Syringe />, type: "dangerPay",  dateCompleted: "2019-01-03 09:00:00", month: "1", points: "20", minutes: "20", progress: "1" },
    { id: 0, key: "beachBum_2", badgeTheme: "Beach Bum", pic: <Umbrella />, type: "beachBum", dateCompleted: "2019-01-03 09:00:00", month: "1", points: "10", minutes: "20", progress: "2"}, // this achievement comes from the same plog as the "Danger Pay" plog right before it
    //{ id: 8, key: "", badgeTheme: "Daredevil", pic: <Bike />, type: "daredevil", dateCompleted: "", month: "", points: "20", minutes: "", progress: "" },
    { id: 9, key: "100Club_55", badgeTheme: "100 Club", pic: <DoubleCheckmark />, type: "100Club", dateCompleted: "", month: "", points: "1000", minutes: "", progress: "55" },
    /*{ id: 10, key: "", badgeTheme: "Busy Bee", pic: <Globe />, type: "busyBee", dateCompleted: "", month: "", points: "50", minutes: "", progress: "" }, // this one will need comparisons with other ploggers */
    //{ id: 11, key: "", badgeTheme: "Nature Child", pic: <Flower />, type: "natureChild", dateCompleted: "", month: "", points: "100", minutes: "", progress: "" },
    //{ id: 12, key: "", badgeTheme: "Street Cred", pic: <TourMap />, type: "streetCred", dateCompleted: "", month: "", points: "100", minutes: "", progress: "" },
    { id: 13, key: "oceanographer_7", badgeTheme: "Oceanographer", pic: <Waterpolo />, type: "oceanographer", dateCompleted: "", month: "", points: "100", minutes: "", progress: "7" }, // ideally, should not show up because progress < 10
    /*{ id: 14, key: "", badgeTheme: "Break the Seal", pic: <Home />, type: "breakTheSeal", dateCompleted: "", month: "", points: "100", minutes: "", progress: "" }, // also needs comparison with other ploggers */

    { id: 15, key: "dogDays_1", badgeTheme: "Dog Days", pic: <DogWalking />, type: "dogDays", dateCompleted: "2019-06-07 08:00:00", month: "6", points: "50", minutes: "30", progress: "1" },
    { id: 0, key: "beachBum_5", badgeTheme: "Beach Bum", pic: <Umbrella />, type: "beachBum", dateCompleted: "2019-06-07 08:00:00", month: "6", points: "10", minutes: "30", progress: "5"},

    { id: 16, key: "springChicken_1", badgeTheme: "Spring Chicken", pic: <Chicken />, type: "springChicken", dateCompleted: "2019-03-04 10:00:00", month: "3", points: "50", minutes: "40", progress: "1" },
    { id: 0, key: "beachBum_3", badgeTheme: "Beach Bum", pic: <Umbrella />, type: "beachBum", dateCompleted: "2019-03-04 10:00:00", month: "3", points: "10", minutes: "40", progress: "3"},
    { id: 0, key: "beachBum_4", badgeTheme: "Beach Bum", pic: <Umbrella />, type: "beachBum", dateCompleted: "2019-04-05 11:00:00", month: "4", points: "10", minutes: "20", progress: "4"},

    { id: 17, key: "fallColor_1", badgeTheme: "Fall Color", pic: <Leaves />, type: "fallColor", dateCompleted: "2019-09-10 09:00:00", month: "9", points: "50", minutes: "30", progress: "1" },
    { id: 0, key: "beachBum_7", badgeTheme: "Beach Bum", pic: <Umbrella />, type: "beachBum", dateCompleted: "2019-09-10 09:00:00", month: "9", points: "10", minutes: "30", progress: "7"},

    { id: 18, key: "polarBear_1", badgeTheme: "Polar Bear", pic: <Bear />, type: "polarBear", dateCompleted: "2019-00-02 06:05:00", month: "0", points: "50", minutes: "30", progress: "1" },
    { id: 0, key: "beachBum_1", badgeTheme: "Beach Bum", pic: <Umbrella />, type: "beachBum", dateCompleted: "2019-00-02 06:05:00", month: "0", points: "10", minutes: "30", progress: "1" },

    //{ id: 19, key: "", badgeTheme: "Pay it Forward", pic: <Face />, type: "payItForward", dateCompleted: "", month: "", points: "50", minutes: "", progress: "" },
    //{ id: 20, key: "", badgeTheme: "Plog Away", pic: <Airplane />, type: "plogAway", dateCompleted: "", month: "", points: "500", minutes: "", progress: "" },
    { id: 21, key: "1000Club_55", badgeTheme: "1000 Club", pic: <Star />, type: "1000Club", dateCompleted: "", month: "", points: "10000", minutes: "", progress: "55" }
];

export default AchievedMockup;
