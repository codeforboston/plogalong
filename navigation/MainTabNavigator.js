import * as React from 'react';
import { Image, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';

import icons from '../icons';
import Colors from '../constants/Colors';

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

const makeTabOptions = (name, current) => ({
  tabBarIcon: () => React.createElement(Icons[name], {
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

export default connect(state => ({
    currentUser: state.users.current,
    preferences: state.preferences,
}))(class extends React.Component {
    componentDidMount() {
        const sawIntro = this.props.preferences.sawIntro;
        const {navigation} = this.props;

        if (!sawIntro) {
            navigation.navigate('Intro');
            return;
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentUser && !this.props.currentUser) {
            this.props.navigation.navigate("Login");
        }
    }

    render() {
        const {currentUser, navigation, route, ...props} = this.props;

        const childRouteName = route.state ? route.state.routes[route.state.index].name : 'Plog';
        navigation.setOptions({
            title: decamel(routeName(route, 'Plog')),
            headerShown: childRouteName !== 'More',
        });

        if (!currentUser)
            return null;

        return (
            <Tab.Navigator initialRouteName="Plog"
                           tabBar={TabBarComponent}>
              {Tabs.map(([name, component]) =>
                        <Tab.Screen name={name}
                                    key={name}
                                    component={component}
                                    options={makeTabOptions(name, childRouteName)}/>
                       )}
            </Tab.Navigator>
        );
    }
});

const styles = StyleSheet.create({
  tabIcon: {
    flex: 1,
    aspectRatio: 1
  }
});
