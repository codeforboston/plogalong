import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DismissButton from './DismissButton';
import $S from '../styles';


const ModalHeader = ({children, onDismiss, onPressDismiss, dismissButtonColor, Button = DismissButton}) => (
  <View style={styles.modalHeader}>
    <Text style={$S.headline}>
      {children}
    </Text>
    <Button onPress={onPressDismiss}
            onDismiss={onDismiss}
            color={dismissButtonColor}
            style={{ paddingTop: 0 }}
    />
  </View>
);

const styles = StyleSheet.create({
  modalHeader: {
    alignContent: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});

export default ModalHeader;
