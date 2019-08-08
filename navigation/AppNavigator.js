import { createAppContainer, createStackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import CameraScreen from '../screens/CameraScreen';
import PublicNavigator from './PublicNavigator';
// import IntroScreen from '../screens/IntroScreen';
import ScreenSlider from '../components/ScreenSlider';


export default createAppContainer(createStackNavigator({
    Main: MainTabNavigator,
    Public: PublicNavigator,
    Intro: ScreenSlider,
    // Intro: IntroScreen,
    Camera: CameraScreen
}, {
    headerMode: 'none',
    initialRouteName: 'Main',
    defaultNavigationOptions: {
        header: null
    },
    mode: 'modal'
}));
