import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import {
  linkToEmail, linkToFacebook, linkToGoogle,
  unlinkFacebook, unlinkGoogle,
  mergeAnonymousAccount
} from '../firebase/auth';
import * as actions from '../redux/actions';
import { indexBy } from '../util';
import { useEffectWithPrevious, useParams } from '../util/react';
import { withPrompt } from '../Prompt';

import $S from '../styles';

import Button from '../components/Button';
import ModalHeader from '../components/ModalHeader';
import Error from '../components/Error';
import Loading from '../components/Loading';
import PasswordInput from '../components/PasswordInput';

/** @typedef {import('../firebase/project/functions/shared').UserData} UserData */
/** @typedef {import('firebase').User & { data?: UserData }} User */

const SignupScreen = props => {
  const {currentUser, navigation, prompt} = props;

  const {params, setter} = useParams({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const enabled = useMemo(() => (
    params && params.email && params.password && params.password === params.confirmPassword
  ), [params]);
  const [authenticating, setAuthenticating] = useState(null);
  const [error, setError] = useState(null);

  const link = async (fn, ...args) => {
    try {
      setError(null);
      setAuthenticating(true);
      await fn(...args);
      navigation.pop();
    } catch (e) {
      if (e.code === 'auth/credential-already-in-use') {
        const { credential } = e;

        const result = await prompt({
          title: 'Link to existing account?',
          message: 'Another Plogalong user is already linked to that account. Do you want to add your plogs to the existing user? ',
          value: '',
          options: [
            {
              title: 'Merge accounts',
              value: 'merge',
              run: async (setMessage) => {
                setMessage('Merging accounts...');
                await mergeAnonymousAccount(credential, { email: e.email });
              }
            },

            {
              title: 'Cancel',
              run: () => { },
            }
          ]
        });

        if (result === 'merge')
          navigation.pop();
      } else {
        console.log(e.code);
        setError(e);
      }
    } finally {
      setAuthenticating(false);
    }
  };

  const onSubmit = useCallback(() => {
    link(linkToEmail, params.email, params.password);
  }, [enabled && params]);
  const onDismiss = useCallback(() => {
    setError(null);
  }, []);
  const providers = useMemo(() => indexBy(currentUser.providerData, 'providerId'),
                            [currentUser]);

  const content = authenticating ?
        <Loading /> :
        <>
          <ModalHeader onDismiss={onDismiss} dismissButtonColor="black">
            Create your account
          </ModalHeader>
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
                             onChangeText={setter('email')}
                  />
                </View>
                <View style={$S.inputGroup}>
                  <Text style={$S.inputLabel}>Password</Text>
                  <PasswordInput autoCompleteType="password"
                                 onChangeText={setter('password')}
                                 value={params.password}
                  />
                </View>
                {!!params.password && <View style={$S.inputGroup}>
                     <Text style={$S.inputLabel}>Retype Pasword</Text>
                     <PasswordInput autoCompleteType="password"
                                    onChangeText={setter('confirmPassword')}
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
                <Button primary
                        onPress={null}
                        title="Disconnect Facebook" />
              ) :
              (
                <Button
                  primary
                  onPress={_ => link(linkToFacebook)}
                  title="Facebook Login"
                />
              )
          }
          {
            providers['google.com'] ?
              (
                <Button primary
                        onPress={null}
                        title="Disconnect Google" />
              ) :
              (
                <Button
                  primary
                  onPress={_ => link(linkToGoogle)}
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
)(withPrompt(SignupScreen));
