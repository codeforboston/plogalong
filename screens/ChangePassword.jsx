import * as React from 'react';
import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { Formik } from 'formik';
import * as yup from 'yup';

import * as actions from '../redux/actions';
import { firebase, auth } from '../firebase/init';
import $S from '../styles';

import Button from '../components/Button';
import ModalHeader from '../components/ModalHeader';
import { LoadingOverlay } from '../components/Loading';
import PasswordInput from '../components/PasswordInput';

/** @typedef {import('../firebase/project/functions/shared').UserData} UserData */
/** @typedef {import('firebase').User & { data?: UserData }} User */


/** @type {React.FunctionComponent<{ currentUser: User }>} */
const ChangePassword = ({flashMessage, navigation, route}) => {
  const { params } = route;
  const oobCode = params && params.oobCode;

  const schema = yup.object({
    oldPassword: oobCode ? null : yup.string().required().label('Old Password'),
    newPassword: yup.string().required().label('New Password'),
    confirmPassword: yup.string().required().oneOf([yup.ref('newPassword')], 'The passwords do not match')
  });

  return (
    <SafeAreaView style={$S.safeContainer}>
      <View style={[$S.container, $S.form]}>
        <ModalHeader dismissButtonColor="black">
          Change password
        </ModalHeader>

        <Formik
          initialValues={{
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={schema}
          validateOnBlur={false}
          validateOnChange={false}
          onSubmit={async (values, bag) => {
            const {currentUser} = auth;

            if (oobCode) {
              try {
                await auth.confirmPasswordReset(oobCode, values.newPassword);
              } catch (err) {
                bag.setFieldError('newPassword', err.message);
                return;
              }
            } else {
              const emailProvider = currentUser.providerData.find(pd => pd.providerId === 'password');
              if (!emailProvider) {
                bag.setFieldError('oldPassword', 'You are not using password login!');
                return;
              }

              const credential = firebase.auth.EmailAuthProvider.credential(emailProvider.email, values.oldPassword);
              try {
                await currentUser.reauthenticateWithCredential(credential);
              } catch (err) {
                bag.setFieldError('oldPassword', err.message);
                return;
              }

              try {
                await currentUser.updatePassword(values.newPassword);
              } catch (err) {
                bag.setFieldError('newPassword', err.message);
                return;
              }
            }

            flashMessage('Your password has been updated!');
            navigation.goBack();
          }}
        >
          {
            ({handleChange, handleSubmit, values, isSubmitting, errors, isValid}) =>
              <View>
                {
                  !oobCode &&
                  <View style={$S.inputGroup}>
                    {errors.oldPassword && <Text style={styles.errorText}>{errors.oldPassword}</Text>}
                    <Text style={$S.inputLabel}>Old Password</Text>
                    <PasswordInput style={$S.textInput}
                      autoCompleteType="off"
                      autoFocus={true}
                      value={values.oldPassword}
                      onChangeText={handleChange('oldPassword')}
                    />
                  </View>
                }
                <View style={$S.inputGroup}>
                  {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
                  <Text style={$S.inputLabel}>New Password</Text>
                  <PasswordInput style={$S.textInput}
                                 value={values.newPassword}
                                 onChangeText={handleChange('newPassword')}
                  />
                </View>
                <View style={$S.inputGroup}>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                  <Text style={$S.inputLabel}>Retype Password</Text>
                  <PasswordInput style={$S.textInput}
                                 value={values.confirmPassword}
                                 onChangeText={handleChange('confirmPassword')}
                  />
                </View>
                <View>
                  <Button primary
                          title="Change Password"
                          onPress={handleSubmit}
                          />
                </View>
                {isSubmitting && <LoadingOverlay/>}
              </View>
          }
        </Formik>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {

  },
  errorText: {
    color: '#ff0000',
    paddingTop: 5,
    textAlign: 'left',
  },
});


export default connect(
  ({users}) => ({
    currentUser: users.current,
  }),
  dispatch => ({
    flashMessage(message) { dispatch(actions.flashMessage(message)); }
  })
)(ChangePassword);
