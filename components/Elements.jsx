import * as React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import $C from '../constants/Colors';

export const Divider = ({style, ...props}) => (
  <View style={[styles.divider, style]} {...props} />
);

const styles = StyleSheet.create({
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: $C.divider,
  },
});
