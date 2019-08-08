import React from 'react';
import { connect } from 'react-redux';
import { createAppContainer, createStackNavigator } from 'react-navigation';

import * as actions from '../redux/actions';

import MainTabNavigator from './MainTabNavigator';
import CameraScreen from '../screens/CameraScreen';
import PublicNavigator from './PublicNavigator';
import IntroScreen from '../screens/IntroScreen';


export default createAppContainer(createStackNavigator({
    Main: MainTabNavigator,
    Public: PublicNavigator,
    Intro: IntroScreen,
    Camera: CameraScreen
}, {
    headerMode: 'none',
    initialRouteName: 'Main',
    defaultNavigationOptions: {
        header: null
    },
    mode: 'modal'
}));
