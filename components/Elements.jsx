import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import $C from '../constants/Colors';
// import $S from '../styles';


export const Divider = ({style, ...props}) => (
  <View style={[styles.divider, style]} {...props} />
);

export const B = ({style, ...props}) => (
  <Text style={[styles.boldText, style]} {...props} />
);

const styles = StyleSheet.create({
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: $C.divider,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
