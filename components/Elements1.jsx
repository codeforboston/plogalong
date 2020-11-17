import * as React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import $C from '../constants/Colors';

export const Divider1 = ({style, ...props}) => (
  <View style={[styles.divider, style]} {...props} />
);

const styles = StyleSheet.create({
  divider1: {
    borderBottomWidth: 5,
    borderBottomColor: $C.divider,
  },
});
