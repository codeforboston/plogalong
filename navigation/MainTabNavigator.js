import React from 'react';
import { Image } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import PlogScreen from '../screens/PlogScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LocalScreen from '../screens/LocalScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MoreScreen from '../screens/MoreScreen';

import Header from '../components/Header';

const Icons = {
    Plog: require('../assets/images/plog.png'),
    History: require('../assets/images/history.png'),
    Local: require('../assets/images/local.png'),
    Profile: require('../assets/images/profile.png'),
    More: require('../assets/images/more.png'),
}

const makeTabNavigationOptions = ({navigation}) => ({
    tabBarLabel: navigation.state.routeName,
    tabBarIcon: (<Image source={Icons[navigation.state.routeName]} />),

});

const makeStackNavigationOptions = ({navigation}) => ({
    headerTitle: (<Header text={navigation.state.routeName}
                          icon={Icons[navigation.state.routeName]} />),
    headerStyle: {
        backgroundColor: '#fff',
        borderBottomColor: 'purple',
        borderBottomWidth: 4
    }
});

const sharedStackOptions = {
    defaultNavigationOptions: makeStackNavigationOptions
};

const Plog = createStackNavigator({
  Plog: PlogScreen,
}, {...sharedStackOptions});

Plog.navigationOptions = makeTabNavigationOptions;

const History = createStackNavigator({
    History: HistoryScreen,
}, {...sharedStackOptions});

History.navigationOptions = makeTabNavigationOptions;

const Local = createStackNavigator({
    Local: LocalScreen,
}, {...sharedStackOptions});

Local.navigationOptions = makeTabNavigationOptions;

const Profile = createStackNavigator({
    Profile: ProfileScreen,
}, {...sharedStackOptions});

Profile.navigationOptions = makeTabNavigationOptions;

const More = createStackNavigator({
    More: MoreScreen,
}, {...sharedStackOptions});

More.navigationOptions = makeTabNavigationOptions;


export default createBottomTabNavigator({
  Plog,
  History,
  Local,
  Profile,
  More
});
