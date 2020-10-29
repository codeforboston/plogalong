import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  linkToEmail,
  linkToGoogle,
  unlinkGoogle,
  linkToApple,
  mergeAnonymousAccount,
  unlinkApple,
  Providers
} from '../firebase/auth';
import { getStats, indexBy } from '../util';
import { useParams } from '../util/react';
import { useAppleSignInAvailable } from '../util/native';
import { usePrompt } from '../Prompt';

import Colors from '../constants/Colors';
import $S from '../styles';

import Button from '../components/Button';
import ModalHeader from '../components/ModalHeader';
import Error from '../components/Error';
import Loading from '../components/Loading';
import PasswordInput from '../components/PasswordInput';
import { useSelector } from '../redux/hooks';
import { auth } from '../firebase/init';


const makeLinkCallback = (navigation, currentUser, prompt, setError, setAuthenticating) => {
  return async (fn, ...args) => {
    setError(null);
    setAuthenticating(true);

     try {
      while (1) {
        try {
          const user = await fn(...args);
          if (user)
            navigation.navigate('Profile');
        } catch (e) {
          if (e.code === 'auth/email-already-in-use') {
            if (e.email) {
              const [provider] = await auth.fetchSignInMethodsForEmail(e.email);
              const providerConfig = Providers[provider];

              if (providerConfig && providerConfig.link) {
                const result = await prompt({
                  title: `Email already in use`,
                  message: `${e.email} is already registered to another user. Would you like to use ${providerConfig.name} to sign in instead?`,
                  options: [
                    {
                      title: `Login with ${providerConfig.name}`,
                      value: 'continue'
                    },
                    {
                      title: 'Cancel',
                    }
                  ]
                });
                if (result === 'continue') {
                  fn = providerConfig.link;
                  continue;
                }
              }

              setError(e);
            }
          } else if (e.code === 'auth/credential-already-in-use') {
            const { credential } = e;

            if (getStats(currentUser, 'total').count) {
              const providerName = (Providers[credential.providerId] || {}).name;
              const accountName = e.email && providerName ? `the ${providerName} account for ${e.email}` :
                    'that account';
              const result = await prompt({
                title: 'Link to existing account?',
                message: `Another Plogalong user is already linked to ${accountName}. Do you want to add your plogs to the existing user? `,
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
                navigation.navigate('Profile');
            } else {
              await mergeAnonymousAccount(credential, { email: e.email });
              navigation.navigate('Profile');
            }
          } else if (e.code !== 'auth/user-canceled') {
            console.log(JSON.stringify(e));
            setError(e);
          }
        }
        break;
      }
     } finally {
       setAuthenticating(false);
     }
  };
};

/** @typedef {import('../firebase/project/functions/shared').UserData} UserData */
/** @typedef {import('firebase').User & { data?: UserData }} User */

const SignupScreen = props => {
  const {navigation} = props;
  const currentUser = useSelector(state => state.users.current);
  const { prompt } = usePrompt();

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
  const appleEnabled = useAppleSignInAvailable();

  const [onGoogleLink, onAppleLink, link] = useMemo(() => {
    const link = makeLinkCallback(navigation, currentUser, prompt, setError, setAuthenticating);
    return [
      link.bind(null, linkToGoogle),
      link.bind(null, linkToApple),
      link
    ];
  }, [navigation, currentUser, prompt]);

  const onSubmit = useCallback(() => {
    link(linkToEmail, params.email, params.password);
  }, [enabled && params]);
  const onDismiss = useCallback(() => { setError(null); }, []);
  const providers =  indexBy(currentUser.providerData, 'providerId');

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
                {!!params.password &&
                 <View style={$S.inputGroup}>
                   <Text style={$S.inputLabel}>Retype Pasword</Text>
                   <PasswordInput autoCompleteType="password"
                                  onChangeText={setter('confirmPassword')}
                                  value={params.confirmPassword}
                                  style={params.password !== params.confirmPassword &&
                                         { borderColor: Colors.errorBackground }}
                   />
                 </View>}
                <Button title="Register"
                        primary
                        onPress={onSubmit}
                        style={{ marginTop: 20 }}
                        disabled={!enabled} />
              </> :

            <>
              <Text>
                Linked to email address: {providers['password']['email']}
              </Text>
            </>
          }
          {
            providers['google.com'] ?
              (
                <Button primary
                        onPress={unlinkGoogle}
                        title="Disconnect Google" />
              ) :
              (
                <Button
                  primary
                  onPress={onGoogleLink}
                  title="Google Login"
                />
              )
          }
          {appleEnabled &&
           (providers['apple.com'] ?
            <Button primary
                    onPress={unlinkApple}
                    title="Disconnect Apple" />
            :
            <Button primary
                    onPress={onAppleLink}
                    title="Apple Login"/>)
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


export default SignupScreen;
