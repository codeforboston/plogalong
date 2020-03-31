import * as React from 'react';

import ClearSky from '../assets/images/weather_icons_pngs/01dSunFlaticon.png';
import FewClouds from '../assets/images/weather_icons_pngs/02dFewCloudsFlaticon.png';
import ScatteredCloudy from '../assets/images/weather_icons_pngs/03dScatteredCloudyFlaticon.png';
import BrokenClouds from '../assets/images/weather_icons_pngs/04dBrokenCloudsFlaticon.png';
import ShowerRain from '../assets/images/weather_icons_pngs/09dShowerRainFlaticon.png';
import Rain from '../assets/images/weather_icons_pngs/10dRainFlaticon.png';
import Thunderstorm from '../assets/images/weather_icons_pngs/11dStormFlaticon.png';
import Snow from '../assets/images/weather_icons_pngs/13dSnowFlaticon.png';
import Mist from '../assets/images/weather_icons_pngs/50dMistFlaticon.png';


let WeatherIcons = [
  { id: 0, key: "clearSky", pic: <ClearSky />, path: '../assets/images/weather_icons_pngs/01dSunFlaticon.png' },
  { id: 1, key: "fewClouds", pic: <FewClouds />, path: '../assets/images/weather_icons_pngs/02dFewCloudsFlaticon.png' },
  { id: 2, key: "scatteredCloudy", pic: <ScatteredCloudy />, path: '../assets/images/weather_icons_pngs/03dScatteredCloudyFlaticon.png' },
  { id: 3, key: "brokenClouds", pic: <BrokenClouds />, path: '../assets/images/weather_icons_pngs/04dBrokenCloudsFlaticon.png' },
  { id: 4, key: "showerRain", pic: <ShowerRain />, path: '../assets/images/weather_icons_pngs/09dShowerRainFlaticon.png' },
  { id: 5, key: "rain", pic: <Rain />, path: '../assets/images/weather_icons_pngs/10dRainFlaticon.png' },
  { id: 6, key: "thunderstorm", pic: <Thunderstorm />, path: '../assets/images/weather_icons_pngs/11dStormFlaticon.png' },
  { id: 7, key: "snow", pic: <Snow />, path: '../assets/images/weather_icons_pngs/13dSnowFlaticon.png' },
  { id: 8, key: "mist", pic: <Mist />, path: '../assets/images/weather_icons_pngs/50dMistFlaticon.png' }
];

export default WeatherIcons;