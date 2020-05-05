import * as React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import $S from '../styles';
import Colors from '../constants/Colors';

/** @typedef {React.ComponentProps<typeof TextInput>} TextInputProps */
/** @typedef {React.ComponentProps<typeof TouchableOpacity>} TouchableOpacityProps */

/**
 * @typedef {TextInputProps & Pick<TouchableOpacityProps, 'onPressIn' | 'onPress'> & { icon?: React.ReactElement, iconName?: string }} TextInputWithIconProps
 */

/** @type {React.FunctionComponent<TextInputWithIconProps>} */
const TextInputWithoutIcon = ({onPressIn, onPress, style, ...props}) => {
  const [isPressed, setPressed] = React.useState(false);
  return (
    <View>
      <TouchableOpacity 
        onPressIn={() => {
          setPressed(true);
          onPressIn && onPressIn();
        }} 
        onPress={onPress}
        onPressOut={() => {
          setPressed(false);
        }}
        style={styles.touchableStyle}>
      </TouchableOpacity>
      <TextInput style={[$S.textInput, styles.inputStyle, isPressed ? styles.purpleOutline : styles.greenOutline]} {...props} />
    </View>
  )
};

export default TextInputWithoutIcon;

const styles = StyleSheet.create({
  inputStyle: {
    flexGrow: 1,
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
  },
  purpleOutline: {
    borderColor: Colors.selectionColor,
    borderWidth: 2,
    fontSize: 18,
    padding: 10,
  },
  greenOutline: {
    borderColor: Colors.secondaryColor,
    borderWidth: 2,
    fontSize: 18,
    padding: 10,
  },
});
