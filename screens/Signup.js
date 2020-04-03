import * as React from 'react';
import {
  SafeAreaView,
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
import PasswordInput from '../components/PasswordInput';


class SignupScreen extends React.Component {
  state = {
    params: {},
  }

    onSubmit = () => {
        if (this.disabled())
            return;

        const {params} = this.state;
        this.props.linkToEmail(params.email, params.password);
    }

    disabled = () => {
        const {params} = this.state;
        return !params || !params.email || !params.password || (params.password !== params.confirmPassword);
    }

    render() {
        const {params} = this.state;
      const {currentUser, error} = this.props;
      const setParam = param => (text => {
        this.setState(({params}) => ({params: { ...params, [param]: text }}));

        // Clear error message if user enters new text
        this.props.clearSignupError();
      });
        const providers = currentUser && currentUser.providerData.reduce(
            (map, provider) => {
                map[provider.providerId] = provider;
                return map;
            }, {});

        return (
          <SafeAreaView style={$S.safeContainer}>
            <View style={[$S.container, $S.form]}>
              <DismissButton color="black" shouldClearError={true}/>
              {error && <Error error={error}/>}
              {
              !providers['password'] ?
                  <>
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
                      <PasswordInput autoCompleteType="password"
                                     onChangeText={setParam('password')}
                                     value={params.password}
                      />
                    </View>
                    {!!params.password && <View style={$S.inputGroup}>
                                            <Text style={$S.inputLabel}>Retype Pasword</Text>
                                            <PasswordInput autoCompleteType="password"
                                                           onChangeText={setParam('confirmPassword')}
                                                           value={params.confirmPassword}
                                            />
                                          </View>}
                    <Button title="Register"
                            primary
                            onPress={this.onSubmit}
                            style={{ marginTop: 20 }}
                            disabled={this.disabled()} />
                  </> :

                  <>
                    <Text style={{}}>
                      Linked to email address: {providers['password']['email']}
                    </Text>
                  </>
              }
            {
                  providers['facebook.com'] ?
                      (
                          <Button primary onPress={logOut} title="Disconnect Facebook" />
                      ) :
                      (
                          <Button
                            primary
                            onPress={loginWithFacebook}
                            title="Facebook Login"
                          />
                      )
              }
              {
                  providers['google.com'] ?
                      (
                          <Button primary onPress={logOut} title="Disconnect Google" />
                      ) :
                      (
                          <Button
                            primary
                            onPress={this.props.linkToGoogle}
                            title="Google Login"
                          />
                      )
              }
            </View>
          </SafeAreaView>
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
    }
});

const ReduxSignupScreen = connect(
  state => ({
      error: state.users.signupError,
      currentUser: state.users.current,
  }),
    dispatch => ({
        linkToEmail: (...args) => dispatch(actions.linkToEmail(...args)),
        linkToGoogle: (...args) => dispatch(actions.linkToGoogle(...args)),
        clearSignupError: (...args) => dispatch(actions.signupError()),
    })
)(SignupScreen);

export default ReduxSignupScreen;
