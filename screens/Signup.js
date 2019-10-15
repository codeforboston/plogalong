import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import * as actions from '../redux/actions';

import $S from '../styles';

import Button from '../components/Button';
import Error from '../components/Error';
import Link from '../components/Link';


class SignupScreen extends React.Component {
    static navigationOptions = {
        title: 'Sign Up'
    };

    constructor(props) {
        super(props);
        this.state = {
            params: {}
        };
    }

    onSubmit = () => {
        if (this.disabled())
            return;

        const {params} = this.state;
        this.props.signupWithEmail(params.email, params.password);
    }

    disabled = () => {
        const {params} = this.state;
        return !params || !params.email || !params.password || (params.password !== params.confirmPassword);
    }

    render() {
        const {params} = this.state;
        const {error, navigation} = this.props;
        const setParam = param => (text => this.setState(({params}) => ({params: { ...params, [param]: text }})));

        return (
            <View style={[$S.container, $S.form]}>
              {error && <Error error={error.toJS()}/>}
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
              {!!params.password && <View style={$S.inputGroup}>
                                      <Text style={$S.inputLabel}>Retype Pasword</Text>
                                      <TextInput style={$S.textInput}
                                                 autoCompleteType="password"
                                                 secureTextEntry={true}
                                                 onChangeText={setParam('confirmPassword')}
                                                 value={params.confirmPassword}
                                      />
                                    </View>}
              <Button title="Register"
                      primary
                      onPress={this.onSubmit}
                      style={{ marginTop: 20 }}
                      disabled={this.disabled()} />

              <Link onPress={() => { console.log('navigate?'); navigation.navigate('Login'); }}
                    style={{ marginTop: 20, textAlign: 'center' }}>
                Login Screen
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

const ReduxSignupScreen = connect(
  state => ({
      error: state.users.get("signupError")
  }),
    dispatch => ({
        signupWithEmail: (...args) => dispatch(actions.signupWithEmail(...args))
    })
)(SignupScreen);

export default ReduxSignupScreen;
