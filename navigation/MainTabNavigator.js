import * as React from 'react';
import {
  PixelRatio,
  StyleSheet,
} from 'react-native';
import { Linking } from 'expo';
import { connect } from 'react-redux';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';

import { auth } from '../firebase/init';
import icons from '../icons';
import Colors from '../constants/Colors';
import { parseURL } from '../util';
import { processAchievement } from '../util/users';
import { useEffectWithPrevious } from '../util/react';

import Loading from '../components/Loading';

import PlogScreen from '../screens/PlogScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LocalScreen from '../screens/LocalScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MoreScreen from '../screens/MoreScreen';


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

const decamel = s => s.replace(/([^A-Z])([A-Z])/gu, '$1 $2');

const routeName = ({state, params, name}, defaultName=name) => {
    return state ?
        routeName(state.routes[state.index]) :
        (params && params.title || defaultName);
};

const TabBarComponent = props => <BottomTabBar {...props}
                                               style={{
                                                   backgroundColor: '#fff',
                                                   borderTopColor: 'purple',
                                                   borderTopWidth: 4,
                                                   paddingTop: 5,
                                               }}
                                 />;

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ currentUser, navigation, route, ...props }) => {
  const childRouteName = route.state ? route.state.routes[route.state.index].name : 'Plog';
  navigation.setOptions({
    title: decamel(routeName(route, 'Plog')),
    headerShown: childRouteName !== 'More',
  });

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
