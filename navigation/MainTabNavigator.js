import React from 'react';
import { Image } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import PlogScreen from '../screens/PlogScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LocalScreen from '../screens/LocalScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MoreScreen from '../screens/MoreScreen';

const Plog = createStackNavigator({
  Links: PlogScreen,
});

Plog.navigationOptions = {
  tabBarLabel: 'Plog',
  tabBarIcon: () => (
    <Image
      source={require('../assets/images/plog.png')}
    />
  ),
};

const History = createStackNavigator({
  Links: HistoryScreen,
});

History.navigationOptions = {
  tabBarLabel: 'History',
  tabBarIcon: () => (
    <Image
      source={require('../assets/images/history.png')}
    />
  ),
};

const Local = createStackNavigator({
  Links: LocalScreen,
});

Local.navigationOptions = {
  tabBarLabel: 'Local',
  tabBarIcon: () => (
    <Image
      source={require('../assets/images/local.png')}
    />
  ),
};

const Profile = createStackNavigator({
  Links: ProfileScreen,
});

Profile.navigationOptions = {
  tabBarLabel: 'Profile',
  tabBarIcon: () => (
    <Image
      source={require('../assets/images/profile.png')}
    />
  ),
};

const More = createStackNavigator({
  Links: MoreScreen,
});

More.navigationOptions = {
  tabBarLabel: 'More',
  tabBarIcon: () => (
    <Image
      source={require('../assets/images/more.png')}
    />
  ),
};

export default createBottomTabNavigator({
  Plog,
  History,
  Local,
  Profile,
  More
});
