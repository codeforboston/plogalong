import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import * as actions from '../redux/actions';
import { indexBy } from '../util';
import { useEffectWithPrevious } from '../util/react';

import $S from '../styles';

import Button from '../components/Button';
import DismissButton from '../components/DismissButton';
import Error from '../components/Error';
import Loading from '../components/Loading';
import PasswordInput from '../components/PasswordInput';

/** @typedef {import('../firebase/project/functions/shared').UserData} UserData */
/** @typedef {import('firebase').User & { data?: UserData }} User */

const makeParams = init => {
  const [state, setState] = useState(init);

  return [
    state,
    setState,
    k => (text => setState({ ...state, [k]: text }))
  ];
};

const SignupScreen = props => {
  const {authenticating, currentUser, error} = props;

  const navigation = useNavigation();
  useEffectWithPrevious((wasAuthenticating) => {
    if (wasAuthenticating && !authenticating && !error) {
      navigation.pop();
    }
  }, [authenticating, error]);

  const [params, _, setParam] = makeParams({});
  const enabled = useMemo(() => (
    params && params.email && params.password && params.password === params.confirmPassword
  ), [params]);

  const onSubmit = useCallback(() => {
    if (enabled) {
      props.linkToEmail(params.email, params.password);
    }
  }, [enabled && params]);
  const providers = useMemo(() => indexBy(currentUser.providerData, 'providerId'),
                            [currentUser]);

  const content = authenticating ?
        <Loading /> :
        <>
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
                        onPress={onSubmit}
                        style={{ marginTop: 20 }}
                        disabled={!enabled} />
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
                <Button primary onPress={props.unlinkFacebook} title="Disconnect Facebook" />
              ) :
              (
                <Button
                  primary
                  onPress={props.linkToFacebook}
                  title="Facebook Login"
                />
              )
          }
          {
            providers['google.com'] ?
              (
                <Button primary onPress={props.unlinkGoogle} title="Disconnect Google" />
              ) :
              (
                <Button
                  primary
                  onPress={props.linkToGoogle}
                  title="Google Login"
                />
              )
          }
        </>
  ;

  return (
    <SafeAreaView style={$S.safeContainer}>
      <View style={[$S.container, $S.form, authenticating && { justifyContent: 'center' }]}>
        {content}
      </View>
    </SafeAreaView>
  );
};


export default connect(
  state => ({
    error: state.users.signupError,
    currentUser: state.users.current,
    authenticating: state.users.authenticating,
  }),
  dispatch => ({
    linkToEmail: (...args) => dispatch(actions.linkToEmail(...args)),
    linkToGoogle: (...args) => dispatch(actions.linkToGoogle(...args)),
    unlinkGoogle: (...args) => dispatch(actions.unlinkGoogle(...args)),
    linkToFacebook: (...args) => dispatch(actions.linkToFacebook(...args)),
    unlinkFacebook: (...args) => dispatch(actions.unlinkFacebook(...args)),
    clearSignupError: (...args) => dispatch(actions.signupError()),
  })
)(SignupScreen);
