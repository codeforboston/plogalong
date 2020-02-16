import * as React from 'react';
import { Image } from 'react-native';
import { connect } from 'react-redux';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

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
};

const makeTabOptions = (name) => ({
    tabBarIcon: () => <Image source={Icons[name]} />,
});

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
                                                   borderTopWidth: 4
                                               }}
                                 />;

const Tab = createBottomTabNavigator();

export default connect(state => ({
    currentUser: state.users.get("current"),
    userLoaded: state.users.get("init"),
    preferences: state.preferences,
}))(class extends React.Component {
    componentDidMount() {
        const sawIntro = this.props.preferences.get("sawIntro");
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
              <Tab.Screen name="Plog" component={PlogScreen} options={makeTabOptions('Plog')}/>
              <Tab.Screen name="History" component={HistoryScreen} options={makeTabOptions('History')}/>
              <Tab.Screen name="Local" component={LocalScreen} options={makeTabOptions('Local')}/>
              <Tab.Screen name="Profile" component={ProfileScreen} options={makeTabOptions('Profile')}/>
              <Tab.Screen name="More" component={MoreScreen} options={makeTabOptions('More')}/>
            </Tab.Navigator>
        );
    }
});
