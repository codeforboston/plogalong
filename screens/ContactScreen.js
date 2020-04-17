import * as React from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { flashMessage } from '../redux/actions';
import ContactForm from '../components/ContactForm';
import $S from '../styles';

const ContactScreen = ({flashMessage}) => {
  const navigation = useNavigation();
  const onSave = () => {
    flashMessage('Thanks for your feedback!');
    navigation.goBack();
  };

  return (
    <ScrollView style={[$S.screenContainer, ]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.screenContainerStyles}>
          <ContactForm onSave={onSave} />
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    screenContainerStyles: {
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default connect(
  null,
  dispatch => ({
    flashMessage: (...args) => dispatch(flashMessage(...args))
  }))(ContactScreen);
