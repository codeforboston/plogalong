import * as React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Header from '../components/Header';

import MainTabNavigator from './MainTabNavigator';
import PhotoViewer from '../screens/PhotoViewer';
import ScreenSlider from '../components/ScreenSlider';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/Signup';

import icons from '../icons';


const AppStack = createStackNavigator();

export default (props) => {
    return (
    <NavigationContainer>
      <AppStack.Navigator initialRouteName="Main" mode="modal" headerMode="screen">
        <AppStack.Screen name="Main"
                         component={ MainTabNavigator}
                         options={{
                             headerTitle: (props) => {
                                 return <Header text={props.children} icon={icons[props.children]} />;
                             },
                             headerTitleAlign: 'center',
                             headerStyle: {
                                 backgroundColor: '#fff',
                                 borderBottomColor: 'purple',
                                 borderBottomWidth: 4,
                             }
                         }} />
        <AppStack.Screen name="Intro" component={ ScreenSlider} options={{ headerShown: false }}/>
        <AppStack.Screen name="PhotoViewer" component={ PhotoViewer} options={{ headerShown: false }}/>
        <AppStack.Screen name="Login" component={ LoginScreen } options={{ headerShown: false }}/>
        <AppStack.Screen name="Signup" component={ SignupScreen } options={{ headerShown: false }}/>
      </AppStack.Navigator>
    </NavigationContainer>
)};
