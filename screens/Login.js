import * as React from 'react';
import {
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import * as actions from '../redux/actions';
import * as AppleAuthentication from 'expo-apple-authentication';

import $S from '../styles';

import Button from '../components/Button';
import DismissButton from '../components/DismissButton';
import Error from '../components/Error';
import Link from '../components/Link';
import Loading from '../components/Loading';
import PasswordInput from '../components/PasswordInput';

import Logo from '../assets/images/plogalong.png';


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

  componentDidMount() {
    this.props.navigation.addListener('blur', () => {
      Keyboard.dismiss();
    });

    this.props.navigation.addListener('focus', () => {
      this._focusTimeout = setTimeout(() => {
        this._focusInput && this._focusInput.focus();
      }, 1000);
    });
  }

  componentDidUpdate() {
    if (this.props.currentUser) {
      clearTimeout(this._focusTimeout);
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

  renderLoggingIn() {
    return (
      <>
        <Image source={Logo} />
        <Loading/>
        <View style={{ height: 100 }}/>
      </>
    );
  }

  loginAnonymously = () => { this.props.loginAnonymously() }

  intro = () => { this.props.navigation.navigate('Intro'); }
  
  forgotPassword = () => { this.props.navigation.navigate('ForgotPassword'); }

  loginWithGoogle = () => { this.props.loginWithGoogle() }

  _setters = {}
  setParam = (param) => {
    if (!this._setters[param]) {
      this._setters[param] = (text => this.setState(({params}) => ({params: { ...params, [param]: text }})));
    }

    return this._setters[param];
  }

  renderForm = () => {
    const {params} = this.state;
    const {error} = this.props;

    return (
      <>
        {this.props.currentUser &&
         <DismissButton color="black" onDismiss={this.props.clearError} />}
        {error && <Error error={error}/>}
        <View style={$S.inputGroup}>
          <Text style={$S.inputLabel}>Email</Text>
          <TextInput style={$S.textInput}
                     autoCapitalize="none"
                     autoCompleteType="email"
                     ref={input => { this._focusInput = input; }}
                     keyboardType="email-address"
                     value={params.email}
                     onChangeText={this.setParam('email')}
          />
        </View>
        <View style={$S.inputGroup}>
          <Text style={$S.inputLabel}>Password</Text>
          <PasswordInput style={$S.textInput}
                         onChangeText={this.setParam('password')}
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
                onPress={this.loginWithGoogle}
                style={[{ marginTop: 20 }]} />
                  
        {AppleAuthentication.isAvailableAsync() &&
         <Button primary
           onPress={this.props.loginWithApple}
           title="Login with Apple"
         />}
           
        <Link onPress={() => { navigation.navigate('ForgotPassword'); }}
              style={$S.linkStyle} >
          Forgot Your Password?
        </Link>

        <Link onPress={() => { this.props.loginAnonymously(); }}
              style={$S.linkStyle}>
          Skip Registration
        </Link>
        <Link onPress={this.forgotPassword}
              style={styles.linkStyle} >
          Forgot Your Password?
        </Link>

        <Link onPress={this.loginAnonymously}
              style={styles.linkStyle}>
          Skip Registration
        </Link>

        <Link onPress={this.intro}
              style={[$S.helpLink, $S.linkStyle]}>
          What is Plogging?
        </Link>
      </>
    );
  }

  render() {
    return (
        <SafeAreaView style={$S.safeContainer}>
          <View style={[$S.container, $S.form,
          this.props.loggingIn && styles.loggingIn]}>
            {this.props.loggingIn ?
              this.renderLoggingIn() :
              this.renderForm()}
          </View>
        </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  loggingIn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
  },
  loadingText: {
    fontSize: 30
  },
});

export default connect(
  ({users}) => ({
    error: users.loginError,
    currentUser: users.current,
    loggingIn: users.authenticating,
  }),
  dispatch => ({
    clearError: () => dispatch(actions.loginError()),
    loginWithEmail: (...args) => dispatch(actions.loginWithEmail(...args)),
    loginAnonymously: (...args) => dispatch(actions.loginAnonymously(...args)),
    loginWithGoogle: (...args) => dispatch(actions.loginWithGoogle(...args)),
    loginWithApple: (...args) => dispatch(actions.loginWithApple(...args)),
  })
)(LoginScreen);
