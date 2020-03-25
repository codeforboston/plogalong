import * as React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import {
    loginWithFacebook,
    logOut,
} from '../firebase/auth';
import * as actions from '../redux/actions';

import $S from '../styles';

import Button from '../components/Button';
import DismissButton from '../components/DismissButton';
import Error from '../components/Error';
import Link from '../components/Link';

class LoginScreen extends React.Component {
    static navigationOptions = {
        title: 'Log In'
    };

    constructor(props) {
        super(props);
        this.state = {
            params: {}
        };
    }

    componentDidUpdate() {
        if (this.props.currentUser) {
            this.props.navigation.navigate("Main");
        }
    }

    onSubmit = () => {
        if (this.disabled())
            return;

        const {email, password} = this.state.params;
        this.props.loginWithEmail(email, password);
    }

    disabled = () => {
        const {params} = this.state;
        return !params || !params.email || !params.password;
    }

    render() {
        const {params} = this.state;
        const {error, navigation} = this.props;
        const setParam = param => (text => this.setState(({params}) => ({params: { ...params, [param]: text }})));

        return (
            <View style={[$S.container, $S.form]}>
              <DismissButton color="black" />
              {error && <Error error={error}/>}
              <View style={$S.inputGroup}>
                <Text style={$S.inputLabel}>Email</Text>
                <TextInput style={$S.textInput}
                           autoCapitalize="none"
                           autoCompleteType="email"
                           autoFocus={true}
                           keyboardType="email-address"
                           value={params.email}
                           onChangeText={setParam('email')}
                />
              </View>
              <View style={$S.inputGroup}>
                <Text style={$S.inputLabel}>Password</Text>
                <TextInput style={$S.textInput}
                           autoCompleteType="password"
                           secureTextEntry={true}
                           onChangeText={setParam('password')}
                           value={params.password}
                />
              </View>
              <Button title="Login"
                      primary
                      onPress={this.onSubmit}
                      style={[{ marginTop: 20 }]}
                      disabled={this.disabled()} />

              <Button title="Login with Google"
                      primary
                      onPress={this.props.loginWithGoogle}
                      style={[{ marginTop: 20 }]} />

              <Link onPress={() => { this.props.loginAnonymously(); }}
                    style={{ marginTop: 30, textAlign: 'center' }}>
                Skip Registration
              </Link>

              <Link onPress={() => { navigation.navigate('Intro'); }}
                    style={[$S.helpLink, { marginTop: 20, textAlign: 'center' }]}>
                What is Plogging?
              </Link>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20
    },
    contentContainer: {
        paddingTop: 30,
    },
});

export default connect(
    state => ({
        error: state.users.get("loginError"),
        currentUser: state.users.get("current"),
    }),
    dispatch => ({
        loginWithEmail: (...args) => dispatch(actions.loginWithEmail(...args)),
        loginAnonymously: (...args) => dispatch(actions.loginAnonymously(...args)),
        loginWithGoogle: (...args) => dispatch(actions.loginWithGoogle(...args)),
    })
)(LoginScreen);
