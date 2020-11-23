import * as React from 'react';
import {
  PixelRatio,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';

import icons from '../icons';
import Colors from '../constants/Colors';

import Loading from '../components/Loading';

import PlogScreen from '../screens/PlogScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LocalScreen from '../screens/LocalScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MoreScreen from '../screens/MoreScreen';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';


const Icons = {
  Plog: icons.Plog,
  History: icons.History,
  Local: icons.Local,
  Profile: icons.Profile,
  More: icons.More,
};

const makeTabOptions = (name, current, hideIcon) => ({
  tabBarIcon: () => !hideIcon && React.createElement(Icons[name], {
    width: 25, height: 25, style: [styles.tabIcon],
    fill: name === current ? Colors.selectionColor : '#666666'
  }),
});

const Tabs = [
  ['Plog', PlogScreen],
  ['History', HistoryScreen],
  ['Local', LocalScreen],
  ['Profile', ProfileScreen],
  ['More', MoreScreen],
];

const TabBarComponent = props => <BottomTabBar {...props}
                                               style={{
                                                   backgroundColor: '#fff',
                                                   borderTopColor: Colors.activeColor,
                                                   borderTopWidth: 4,
                                                   paddingTop: 5,
                                               }}
                                 />;

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ currentUser, navigation, route, ...props }) => {
  const childRouteName = getFocusedRouteNameFromRoute(route);
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: childRouteName,
      headerShown: childRouteName !== 'More',
    });
  }, [navigation, childRouteName]);

  if (!currentUser)
    return <Loading style={{ marginTop: 150 }} />;

  const pr = PixelRatio.getFontScale();

  return (
    <Tab.Navigator initialRouteName="Plog"
                   tabBar={TabBarComponent}>
      {Tabs.map(([name, component]) =>
                <Tab.Screen name={name}
                            key={name}
                            component={component}
                            options={makeTabOptions(name, childRouteName, pr > 1.5)}/>
               )}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    flex: 1,
    aspectRatio: 1
  }
});
export default MainTabNavigator;
