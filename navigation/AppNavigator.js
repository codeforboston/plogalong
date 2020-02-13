import { createAppContainer, createStackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import CameraScreen from '../screens/CameraScreen';
import PhotoViewer from '../screens/PhotoViewer';
import ScreenSlider from '../components/ScreenSlider';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/Signup';


export default createAppContainer(createStackNavigator({
    Main: MainTabNavigator,
    Intro: ScreenSlider,
    // Intro: IntroScreen,
    Camera: CameraScreen,
    PhotoViewer,
    Login: LoginScreen,
    Signup: SignupScreen,
}, {
    headerMode: 'none',
    initialRouteName: 'Main',
    defaultNavigationOptions: {
        header: null
    },
    mode: 'modal'
}));
