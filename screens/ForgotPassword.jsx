import * as React from 'react';
import { useCallback, useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import * as yup from 'yup';

import * as actions from '../redux/actions';
import { auth } from '../firebase/init';
import $S from '../styles';

import Button from '../components/Button';
import Error from '../components/Error';
import ModalHeader from '../components/ModalHeader';
import { LoadingOverlay } from '../components/Loading';

/** @typedef {import('../firebase/project/functions/shared').UserData} UserData */
/** @typedef {import('firebase').User & { data?: UserData }} User */


const schema = yup.object({
  email: yup.string().required().email().label('Email')
});

const ForgotPassword = ({flashMessage}) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const data = await schema.validate({ email });
      await auth.sendPasswordResetEmail(data.email);
      flashMessage("Check your email for instructions on how to reset your password");
      navigation.goBack();
    } catch (e) {
      console.log(e);
      setError(e);
    } finally {
      setSubmitting(false);
    }
  }, [email]);

  return (
    <SafeAreaView style={$S.safeContainer}>
      <View style={[$S.container, $S.form]}>
        <ModalHeader dismissButtonColor="black">
          Reset Password
        </ModalHeader>

        {error && <Error error={error}/>}
        <View>
          <View style={$S.inputGroup}>
            <Text style={$S.inputLabel}>Email</Text>
            <TextInput style={$S.textInput}
                       autoCapitalize="none"
                       autoCompleteType="email"
                       autoFocus={true}
                       value={email}
                       onChangeText={setEmail}
            />
          </View>
          <View>
            <Button primary
                    title="Send Reset Link"
                    onPress={onSubmit}
            />
          </View>
        </View>
      </View>
      {isSubmitting && <LoadingOverlay/>}
    </SafeAreaView>
  );
};

export default connect(
  null,
  dispatch => ({
    flashMessage(message) { dispatch(actions.flashMessage(message)); }
  })
)(ForgotPassword);
