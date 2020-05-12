import * as React from 'react';
// import { } from 'react-native';
import { NavigationContainer, useLinking } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Linking } from 'expo';

import Header from '../components/Header';

import MainTabNavigator from './MainTabNavigator';
import PhotoViewer from '../screens/PhotoViewer';
import ScreenSlider from '../components/ScreenSlider';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/Signup';
import UserScreen from '../screens/User';
import ChangePassword from '../screens/ChangePassword';
import ForgotPassword from '../screens/ForgotPassword';
import AchievementModal from '../screens/AchievementModal';

import icons from '../icons';


const AppStack = createStackNavigator();

const urlPrefix = Linking.makeUrl('/');
const linkingConfig = {
  ForgotPassword: {
    path: 'forgot'
  },
  Signup: {
    path: 'signup'
  },
  Main: {
    path: ''
  }
};


export default (props) => {
const ref = React.useRef();

  const { getInitialState } = useLinking(ref, {
    prefixes: [urlPrefix],
    config: linkingConfig
  });

  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();

  React.useEffect(() => {
    getInitialState()
      .catch(() => {})
      .then(state => {
        if (state !== undefined) {
          setInitialState(state);
        }

        setIsReady(true);
      });
  }, [getInitialState]);

  if (!isReady) {
    return null;
  }
    return (
    <NavigationContainer initialState={initialState} ref={ref}>
      <AppStack.Navigator mode="modal" headerMode="screen">
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
        <AppStack.Screen name="User" component={ UserScreen } options={{ headerShown: false }}/>
        <AppStack.Screen name="ChangePassword" component={ ChangePassword } options={{ headerShown: false }}/>
        <AppStack.Screen name="ForgotPassword" component={ ForgotPassword } options={{ headerShown: false }}/>
        <AppStack.Screen name="AchievementModal" component={ AchievementModal } options={{ headerShown: false }}/>
      </AppStack.Navigator>
    </NavigationContainer>
)};
