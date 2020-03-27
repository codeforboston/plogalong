import * as React from 'react';
import {Component} from 'react';
import {Image, Text, View} from 'react-native';
import * as Location from 'expo-location';

import config from '../config';

import Colors from '../constants/Colors';
//these are for reference:
import WeatherIcons from '../constants/WeatherIcons';
import Icons from '../icons';
import {ClearSky} from '../assets/images/weather_icons_pngs/01dSunFlaticon.png';
import {FewClouds} from '../assets/images/weather_icons_pngs/02dFewCloudsFlaticon.png';
import {ScatteredCloudy} from '../assets/images/weather_icons_pngs/03dScatteredCloudyFlaticon.png';
import {BrokenClouds} from '../assets/images/weather_icons_pngs/04dBrokenCloudsFlaticon.png';
import {ShowerRain} from '../assets/images/weather_icons_pngs/09dShowerRainFlaticon.png';
import {Rain} from '../assets/images/weather_icons_pngs/10dRainFlaticon.png';
import {Thunderstorm} from '../assets/images/weather_icons_pngs/11dStormFlaticon.png';
import {Snow} from '../assets/images/weather_icons_pngs/13dSnowFlaticon.png';
import {Mist} from '../assets/images/weather_icons_pngs/50dMistFlaticon.png';

class PlogScreenWeather extends Component {
  constructor() {
    super();
    this.state = {
      error: null,
      weatherDetails: null,
      temperature: null
    };
  }
  render() {
    if (this.state.error) {
      return this.renderError();
    }
    if (!this.state.weatherDetails) {
      return this.renderLoading()
    } else {
      const plogMessage = { message: "Sample welcome message" };

      const tempC = this.state.temperature/* i.e., weatherDetails.main.temp*/;
      const tempF = (tempC * 9 / 5) + 32;
      const temps = " " + tempF.toFixed(0) + "\xB0" + "F / " + tempC.toFixed(0) + "\xB0" + "C";

      const tempMin = this.state.weatherDetails.main.temp_min;
      const tempMax = this.state.weatherDetails.main.temp_max;
      const atmospheric = this.state.weatherDetails.weather.id;
      if (tempMin >= 32) {
        plogMessage.message = "Don't go plogging, it's too hot!";
      } else if (atmospheric >= 200 && atmospheric <= 299) {
        plogMessage.message = "Don't go plogging, there's bad weather!";
      } else if (atmospheric == 711 || atmospheric == 731 || atmospheric >= 751) {
        plogMessage.message = "Don't go plogging, there's bad weather!";
      } else if (tempMax >= 30) {
        if (atmospheric >= 302 && atmospheric <= 321) {
          plogMessage.message = "It's going to be hot today - don't do too much plogging! (FYI, there's wet weather!)";
        } else if (atmospheric == 500 || atmospheric == 701) {
          plogMessage.message = "It's going to be hot today - don't do too much plogging! (FYI, there's wet weather!)";
        } else if (atmospheric >= 501 && atmospheric <= 599) {
          plogMessage.message = "It's going to be hot today - don't do too much plogging! (FYI, it's raining!)";
        } else {
          plogMessage.message = "It's going to be hot today - don't do too much plogging!";
        }
      } else if (tempMax <= 30 && tempMin >= 24) {
        if (atmospheric >= 302 && atmospheric <= 321) {
          plogMessage.message = "It's a nice day for plogging, but it could get warm - remember to drink water! (FYI, there's wet weather!)";
        } else if (atmospheric == 500 || atmospheric == 701) {
          plogMessage.message = "It's a nice day for plogging, but it could get warm - remember to drink water! (FYI, there's wet weather!)";
        } else if (atmospheric >= 501 && atmospheric <= 599) {
          plogMessage.message = "It's an okay day for plogging, but it could get warm - remember to drink water! (FYI, it's raining!)";
        } else {
          plogMessage.message = "It's a nice day for plogging, but it could get warm - remember to drink water!";
        }
      } else if (tempMax <= 30 && tempMin >= 10) {
        if (atmospheric >= 302 && atmospheric <= 321) {
          plogMessage.message = "It's a great day to go plogging! (FYI, there's wet weather!)";
        } else if (atmospheric == 500 || atmospheric == 701) {
          plogMessage.message = "It's a great day to go plogging! (FYI, there's wet weather!)";
        } else if (atmospheric >= 501 && atmospheric <= 599) {
          plogMessage.message = "FYI, it's raining!";
        } else {
          plogMessage.message = "It's a great day to go plogging!";
        }
      } else if (tempMin >= 5) {
        if (atmospheric >= 302 && atmospheric <= 321) {
          plogMessage.message = "It's a good day for plogging - make sure you dress warmly enough! (FYI, there's wet weather!)";
        } else if (atmospheric == 500 || atmospheric == 701) {
          plogMessage.message = "It's a good day for plogging - make sure you dress warmly enough! (FYI, there's wet weather!)";
        } else if (atmospheric >= 501 && atmospheric <= 599) {
          plogMessage.message = "FYI, it's raining!";
        } else if (atmospheric == 600) {
          plogMessage.message = "It's a good day for plogging - make sure you dress warmly enough! (FYI, there's light snow!)";
        } else {
          plogMessage.message = "It's a good day for plogging - make sure you dress warmly enough!";
        }
      } else if (tempMin < 5 && tempMin > -6) {
        if (atmospheric >= 302 && atmospheric <= 321) {
          plogMessage.message = "It's cold out today - be extra careful about ice! (FYI, there's wet weather!)";
        } else if (atmospheric == 500 || atmospheric == 701) {
          plogMessage.message = "It's cold out today - be extra careful about ice! (FYI, there's wet weather!)";
        } else if (atmospheric >= 501 && atmospheric <= 599) {
          plogMessage.message = "FYI, it's raining!";
        } else if (atmospheric == 600) {
          plogMessage.message = "It's cold out today - be extra careful about ice! (FYI, there's light snow!)";
        } else if (atmospheric >= 601 && atmospheric <= 699) {
          plogMessage.message = "FYI, it's snowing!";
        } else {
          plogMessage.message = "It's cold out today - be extra careful about ice!";
        }
      } else if (tempMin <= -6) {
        plogMessage.message = "Don't go plogging, it's too cold!";
      };
      console.log(plogMessage.message);
      return (
        
        <View 
          style={{
            backgroundColor: Colors.bannerBackground,
            borderColor: Colors.borderColor,
            borderWidth: 1,
            marginLeft: 20,
            marginRight: 20,
            padding: 5
            }}
        >
          <Text style={{ 
            textAlign: 'center', 
            justifyContent: 'center' 
            }}
          >
            {plogMessage.message}&nbsp; ––&nbsp;  {/*the long hyphen is opt-dash, twice*/}
            <Image
              style={{
                width: 18,
                height: 18,
                marginTop:0,
                marginBottom: -3,
                paddingTop: 0,
                paddingBottom: -10,
                }}
              source={this.state.weatherDetails.weather[0].icon==="01d" ?
                require('../assets/images/weather_icons_pngs/01dSunFlaticon.png')
              : this.state.weatherDetails.weather[0].icon==="02d" ?
                require('../assets/images/weather_icons_pngs/02dFewCloudsFlaticon.png')
              : this.state.weatherDetails.weather[0].icon==="03d" ?
                require('../assets/images/weather_icons_pngs/03dScatteredCloudyFlaticon.png')
              : this.state.weatherDetails.weather[0].icon==="04d" ?
                require('../assets/images/weather_icons_pngs/04dBrokenCloudsFlaticon.png')
              : this.state.weatherDetails.weather[0].icon==="09d" ?
                require('../assets/images/weather_icons_pngs/09dShowerRainFlaticon.png')
              : this.state.weatherDetails.weather[0].icon==="10d" ?
                require('../assets/images/weather_icons_pngs/10dRainFlaticon.png')
              :this.state.weatherDetails.weather[0].icon==="11d" ?
                require('../assets/images/weather_icons_pngs/11dStormFlaticon.png')
              : this.state.weatherDetails.weather[0].icon==="13d" ?
                require('../assets/images/weather_icons_pngs/13dSnowFlaticon.png')
              : this.state.weatherDetails.weather[0].icon==="50d" ?
                require('../assets/images/weather_icons_pngs/50dMistFlaticon.png')
              : require('../assets/images/weather_icons_pngs/03dScatteredCloudyFlaticon.png')
              }
            />
            &nbsp;{temps}
          </Text>
        </View>
      );
    }
  
  }
  
  componentDidMount() {
      Location.getCurrentPositionAsync().then(position => {
        let latit = position.coords.latitude;
        let longit = position.coords.longitude;
        let toGetWeather = "?lat=" + latit.toFixed(4) + "&lon=" + longit.toFixed(4);

        let apiKey = config.openWeatherMapKey;

        if (!apiKey) {
          console.log("Missing API key");
          {/* console.warn("Missing API key"); */}
        } else {
        fetch("http://api.openweathermap.org/data/2.5/weather" 
          + toGetWeather 
            + "&units=metric&APPID=" + apiKey)
// Contact the dev team for the api key, and only use it in your local work for the time being if you need to.
// This is to avoid losing control of the api key and it being overused or misused.
            .then(response => {
              if (response.status !== 200) {
                console.log("API call was unsuccessful. Status code: " + response.status);
                {/* console.warn("API call was unsuccessful. Status code: " + response.status); */}
                return;
              }
              response.json()
              .then(data => {
                this.setState({
                  weatherDetails: data,
                  temperature: data.main.temp
                })
              })
            })
            .catch(err => {
              console.log('Error', err);
              this.setState({
                error: err
              });
            })       
        }
      });
  }

  renderError() {
    console.log('renderError', this.state);
    return (
      <Text>{this.state.error.message}</Text>
    );
  }

  renderLoading() {
    return (
      <Text>
        Every plogging day is a good day!
{/*        Hi there - sorry, we can't give you weather info right now! */}
      </Text>
    )
  }
}
export default PlogScreenWeather
