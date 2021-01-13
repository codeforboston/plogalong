import * as React from 'react';
import { useCallback } from 'react';
import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {KeyboardAwareScrollView as ScrollView} from 'react-native-keyboard-aware-scrollview';
import { AppleAuthenticationButton, AppleAuthenticationButtonStyle, AppleAuthenticationButtonType } from 'expo-apple-authentication';

import * as actions from '../redux/actions';
import { useSelector, useDispatch } from '../redux/hooks';
import { useParams, useEffectWithPrevious } from '../util/react';
import { useAppleSignInAvailable } from '../util/native';

import $S from '../styles';

import Button from '../components/Button';
import DismissButton from '../components/DismissButton';
import Error from '../components/Error';
import Link from '../components/Link';
import { NavLink } from '../components/Link';
import Loading from '../components/Loading';
import PasswordInput from '../components/PasswordInput';
import TextInput from '../components/TextInput';
import { useNavigation, useRoute } from '@react-navigation/native';


const LoginForm = (
  {currentUser, disabled, error, params, setter, loginWithGoogle, loginWithApple, onSubmit, loginAnonymously}) => {
  return (
    <>
      {currentUser &&
       <DismissButton color="black" />}
      {error && <Error error={error}/>}
      <View style={$S.inputGroup}>
        <Text style={$S.inputLabel}>Email</Text>
        <TextInput style={$S.textInput}
                   autoCapitalize="none"
                   autoCompleteType="email"
                   textContentType="username"
                   keyboardType="email-address"
                   value={params.email}
                   onChangeText={setter('email')}
        />
      </View>
      <View style={$S.inputGroup}>
        <Text style={$S.inputLabel}>Password</Text>
        <PasswordInput style={$S.textInput}
                       onChangeText={setter('password')}
                       textContentType="password"
                       value={params.password}
        />
      </View>
      <Button title="Login"
              primary
              onPress={onSubmit}
              style={[styles.button]}
              disabled={disabled} />

      {loginWithGoogle &&
        <Button title="Login with Google"
        primary
        onPress={loginWithGoogle}
        style={[styles.button]} />}

      {loginWithApple &&
        <AppleAuthenticationButton 
                    onPress={loginWithApple}
                    buttonType={AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                    style={styles.button}
       />}

      <NavLink route="ForgotPassword" style={styles.centered}>
        Forgot Your Password?
      </NavLink>

      {loginAnonymously &&
       <Link onPress={loginAnonymously} style={styles.centered}>
        Skip Registration
       </Link>}

      <NavLink route="Intro" style={[$S.helpLink, styles.centered]}>
        What is Plogging?
      </NavLink>
    </>
  );
};

export const LoginScreen = ({ loggingIn, ...props }) => {
  return (
    <SafeAreaView style={$S.safeContainer}>
      <ScrollView style={$S.screenContainer}
                  contentContainerStyle={[$S.container, $S.scrollContentContainer, loggingIn && styles.loggingInContainer]}>
      {loggingIn
       ? <Loading style={{ marginVertical: 100 }}/>
       : <LoginForm {...props} />
      }
      </ScrollView>
      </SafeAreaView>
  );
};

export default () => {
    const {currentUser, error, loggingIn} = useSelector(({users}) => ({
        currentUser: users.current,
        error: users.loginError,
        loggingIn: users.authenticating,
    }));

    const dispatch = useDispatch();
    const { params: routeParams } = useRoute();

    const {params, setter} = useParams(Object.assign({
        email: '',
        password: ''
    }, routeParams && routeParams.form));

    const disabled = !params || !params.email || !params.password;
    const onSubmit = useCallback(() => {
        if (disabled) return;

        dispatch(actions.loginWithEmail(params.email, params.password));
    }, [disabled, params]);
    const onGoogle = useCallback(() => dispatch(actions.loginWithGoogle()), []);
    const onApple = useCallback(() => dispatch(actions.loginWithApple()), []);
    const onSkip = useCallback(() => dispatch(actions.loginAnonymously()), []);

    const navigation = useNavigation();
    const appleAuthAvailable = useAppleSignInAvailable();

    React.useEffect(() => {
        const onBlur = () => {
            Keyboard.dismiss();
            dispatch(actions.loginError(null));
        };

        navigation.addListener('blur', onBlur);
        return () => { navigation.removeListener('blur', onBlur); };
    }, []);

    useEffectWithPrevious((wasLoggingIn) => {
        if (wasLoggingIn && !loggingIn && !error) {
            navigation.navigate('Main');
        }
    }, [loggingIn, error]);

    return (
        <LoginScreen loggingIn={loggingIn}
          onSubmit={onSubmit}
        disabled={disabled}
        params={params}
        setter={setter}
        error={error}
        loginWithGoogle={onGoogle}
        loginWithApple={appleAuthAvailable && onApple}
        loginAnonymously={onSkip}
        currentUser={currentUser}
        />
    );
};

const styles = StyleSheet.create({
  loggingIn: {
    paddingTop: 50,
  },
  loggingInContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centered: {
    marginTop: 30,
    textAlign: 'center'
  },
  button: {
    marginHorizontal: 40, 
    marginTop: 20,
    height: 42,
  }
});
