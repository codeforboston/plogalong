import * as React from 'react';
import {
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import {KeyboardAwareScrollView as ScrollView} from 'react-native-keyboard-aware-scrollview';

import * as actions from '../redux/actions';
import * as AppleAuthentication from 'expo-apple-authentication';

import $S from '../styles';

import Button from '../components/Button';
import DismissButton from '../components/DismissButton';
import Error from '../components/Error';
import Link from '../components/Link';
import { NavLink } from '../components/Link';
import Loading from '../components/Loading';
import PasswordInput from '../components/PasswordInput';
import TextInput from '../components/TextInput';


class LoginScreen extends React.Component {
  static navigationOptions = {
    title: 'Log In'
  };

  constructor(props) {
    super(props);
    this.state = {
      params: {},
      appleAuthAvailable: false,
    };
  }

  componentDidMount() {
    this.props.navigation.addListener('blur', () => {
      Keyboard.dismiss();
    });

    AppleAuthentication.isAvailableAsync().then(appleAuthAvailable => {
      this.setState({ appleAuthAvailable });
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
        <Loading style={{ marginVertical: 100 }}/>
    );
  }

  loginAnonymously = () => this.props.loginAnonymously()

  loginWithGoogle = () => this.props.loginWithGoogle()

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
                     textContentType="username"
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
                         textContentType="password"
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

        {this.state.appleAuthAvailable &&
         <Button primary
           onPress={this.props.loginWithApple}
           title="Login with Apple"
         />}

        <NavLink route="ForgotPassword" style={styles.centered}>
          Forgot Your Password?
        </NavLink>

        <Link onPress={this.loginAnonymously}
              style={styles.centered}>
          Skip Registration
        </Link>

        <NavLink route="Intro" style={[$S.helpLink, styles.centered]}>
          What is Plogging?
        </NavLink>
      </>
    );
  }

  render() {
    const { loggingIn } = this.props;

    return (
        <SafeAreaView style={$S.safeContainer}>
          <ScrollView style={[$S.form, loggingIn && styles.loggingIn]}
                      contentContainerStyle={[$S.container,
                                              loggingIn && styles.loggingInContainer]}>
            {loggingIn ?
             this.renderLoggingIn() :
             this.renderForm()}
          </ScrollView>
        </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  loggingIn: {
    paddingTop: 50,
  },
  loggingInContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingText: {
    fontSize: 30
  },
  centered: {
    marginTop: 30,
    textAlign: 'center'
  }
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
