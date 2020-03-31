import * as React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import $S from '../styles';

/** @typedef {React.ComponentProps<typeof TextInput>} TextInputProps */
/** @typedef {React.ComponentProps<typeof TouchableOpacity>} TouchableOpacityProps */

/**
 * @typedef {TextInputProps & Pick<TouchableOpacityProps, 'onPressIn' | 'onPress'> & { icon?: React.ReactElement, iconName?: string }} TextInputWithIconProps
 */

/** @type {React.FunctionComponent<TextInputWithIconProps>} */
const TextInputWithIcon = ({onPressIn, onPress, icon, iconName, style, ...props}) => (
  <View>
    <TouchableOpacity onPressIn={onPressIn} onPress={onPress} style={styles.touchableStyle}>
      {icon ?
       React.cloneElement(icon, { style: [styles.sharedIconStyle, icon.props.style]}) :
       iconName ?
       <Ionicons size={30} style={[styles.iconStyle, styles.sharedIconStyle]}
                 name={iconName} /> :
       null}
    </TouchableOpacity>
    <TextInput style={[$S.textInput, styles.inputStyle]} {...props} />
  </View>
);

export default TextInputWithIcon;

const styles = StyleSheet.create({
  inputStyle: {
    flexGrow: 1,
  },
  sharedIconStyle: {
    paddingRight: 5,
    paddingTop: 2,
  },
  touchableStyle: {
    position: 'absolute',
    right: 0,
    height: '100%',
    zIndex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  iconStyle: {
    color: '#666666'
  }
});
