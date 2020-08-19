import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Linking } from 'expo';

import { auth } from '../firebase/init';
import { parseURL } from '../util';
import { useEffectWithPrevious } from '../util/react';
import { useSelector, useDispatch } from '../redux/hooks';
import * as actions from '../redux/actions';

import Header from '../components/Header';

import InviteModalScreen  from '../screens/InviteModalScreen';
import MainTabNavigator from './MainTabNavigator';
import PhotoViewer from '../screens/PhotoViewer';
import ScreenSlider from '../components/ScreenSlider';
import LoginScreen from '../screens/Login';
import RegionLeaderboardScreen from '../screens/Leaderboard';
import SignupScreen from '../screens/Signup';
import UserScreen from '../screens/User';
import ChangePassword from '../screens/ChangePassword';
import ForgotPassword from '../screens/ForgotPassword';
import AchievementModal from '../screens/AchievementModal';

import icons from '../icons';


const AppStack = createStackNavigator();

const AppNavigator = () => {
  const ref = React.useRef(/** @type {NavigationContainer} */(null));
  const url = Linking.useUrl();

  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.users.current);
  const preferences = useSelector(state => state.preferences);

  useEffectWithPrevious(async (lastURL, prevUser) => {
    if (!ref.current)
      return;

    const navigation = ref.current;

    if (url && lastURL !== url) {
      const parsed = parseURL(url);

      if (parsed) {
        if (parsed.params['mode'] === 'verifyEmail') {
          try {
            await auth.applyActionCode(parsed.params['oobCode']);
            dispatch(actions.flashMessage('Your email address is now confirmed.'));
          } catch (err) {
            dispatch(actions.flashMessage(err.toString()));
          }
          return;
        } else if (parsed.params['mode'] === 'resetPassword') {
          navigation.navigate('ChangePassword', parsed.params);
          return;
        }
      }
    }

    if (!currentUser) {
      if (!preferences.sawIntro) {
        navigation.navigate('Intro');
      } else if (prevUser || (prevUser === undefined && currentUser === null)) {
        // We can get here two ways:
        // Either the user just logged out (prevUser is truthy)

        // Or Firebase just finished initializing (prevUser is undefined), and
        // there's no current user
        navigation.navigate('Login');
      }
    } else if (prevUser !== currentUser) {
      if (prevUser && currentUser && prevUser.uid === currentUser.uid) {
        // Same user, but changed
        const {data} = currentUser;
        const {data: prevData} = prevUser;

        if (prevData && data.achievements && !prevData.notLoaded) {
          const prevAchievements = prevData.achievements || {};
          // This code is structured as if we wanted to find ALL the newly
          // completed achievements. At least for now, though, we're just
          // showing one modal.

          for (const k of Object.keys(data.achievements)) {
            if ((!prevAchievements[k] || !prevAchievements[k].completed) &&
                data.achievements[k] && data.achievements[k].completed) {

              if (Date.now() - data.achievements[k].completed.toMillis() > 5*60000)
                continue;

              setTimeout(() => {
                navigation.navigate('AchievementModal', { achievementType: k });
              }, 0);
              return;
            }
          }
        }
      } else {
        navigation.navigate('Main');
      }
    }
  }, [url, currentUser]);

  return (
    <NavigationContainer ref={ref}>
      <AppStack.Navigator mode="modal" headerMode="screen" initialRouteName="Main">
        <AppStack.Screen name="Main"
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
                         }}>
          {props => <MainTabNavigator currentUser={currentUser} {...props} />}
      </AppStack.Screen>
        <AppStack.Screen name="Intro" component={ ScreenSlider} options={{ headerShown: false }}/>
        <AppStack.Screen name="PhotoViewer" component={ PhotoViewer} options={{ headerShown: false }}/>
        <AppStack.Screen name="Login" component={ LoginScreen } options={{ headerShown: false }}/>
        <AppStack.Screen name="Signup" component={ SignupScreen } options={{ headerShown: false }}/>
        <AppStack.Screen name="User" component={ UserScreen } options={{ headerShown: false }}/>
        <AppStack.Screen name="Leaderboard" component={ RegionLeaderboardScreen } options={{ headerShown: false }}/>
        <AppStack.Screen name="ChangePassword" component={ ChangePassword } options={{ headerShown: false }}/>
        <AppStack.Screen name="ForgotPassword" component={ ForgotPassword } options={{ headerShown: false }}/>
        <AppStack.Screen name="AchievementModal" component={ AchievementModal } options={{ headerShown: false }}/>
        <AppStack.Screen name="Invite" component={ InviteModalScreen } options={{ headerShown: false }}/>
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
