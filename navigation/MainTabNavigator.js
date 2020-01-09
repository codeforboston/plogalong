import React from 'react';
import { Image } from 'react-native';
import { createStackNavigator, createBottomTabNavigator, BottomTabBar } from 'react-navigation';
import { connect } from 'react-redux';

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

const TabBarComponent = props => <BottomTabBar {...props} />;

const MainTabNavigator = createBottomTabNavigator({
  Plog,
  History,
  Local,
  Profile,
  More
},
{
    tabBarComponent: props => (
        <TabBarComponent {...props} 
            style={{
                backgroundColor: '#fff',
                borderTopColor: 'purple',
                borderTopWidth: 4
            }}
        />
    )
}
);

export default connect(state => ({
    currentUser: state.users.get("current"),
    userLoaded: state.users.get("init"),
    preferences: state.preferences,
}))(class extends React.Component {
    static router = MainTabNavigator.router;

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
        const {currentUser, ...props} = this.props;

        if (!currentUser)
            return null;

        return <MainTabNavigator {...props} />;
    }
});
