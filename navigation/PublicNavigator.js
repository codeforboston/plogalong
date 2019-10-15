import React from 'react';
import {
    ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { createStackNavigator } from 'react-navigation';

import SignupScreen from '../screens/Signup';
import LoginScreen from '../screens/Login';


const PublicNavigator = createStackNavigator({
    Login: LoginScreen,
    Signup: SignupScreen
}, {
    headerMode: 'screen',
    initialRouteName: 'Login',
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: '#fff',
            borderBottomColor: 'purple',
            borderBottomWidth: 4
        }
    }});

export default connect(state => ({
    currentUser: state.users.get("current"),
    preferences: state.preferences,
    userLoaded: state.users.get("init"),
}))(class extends React.Component {
    static router = PublicNavigator.router;

    constructor(props) {
        super(props);
        this._dismissing = false;
    }

    componentDidMount() {
        const sawIntro = this.props.preferences.get("sawIntro");
        const {navigation} = this.props;

        if (!sawIntro) {
            navigation.navigate('Intro');
            return;
        }

        navigation.addListener("didBlur", () => {
            this._dismissing = false;
        });
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.currentUser && this.props.currentUser) {
            this._dismissing = true;
            this.props.navigation.navigate("Main");
        }
    }

    render() {
        const {userLoaded, ...props} = this.props;

        if (!userLoaded || this._dismissing)
            return <ActivityIndicator />;

        return <PublicNavigator {...props} />;
    }
});
