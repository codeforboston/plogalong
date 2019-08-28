import React from 'react';
import { createAppContainer, createStackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import CameraScreen from '../screens/CameraScreen';
import PublicNavigator from './PublicNavigator';


export default createAppContainer(createStackNavigator({
    Main: MainTabNavigator,
    Public: PublicNavigator,
    Camera: CameraScreen
}, {
    headerMode: 'none',
    defaultNavigationOptions: {
        header: null
    },
    mode: 'modal'
}));
