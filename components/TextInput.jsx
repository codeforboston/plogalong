import * as React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import $S from '../styles';
import Colors from '../constants/Colors';

/** @typedef {React.ComponentProps<typeof TextInput>} TextInputProps */
/** @typedef {React.ComponentProps<typeof TouchableOpacity>} TouchableOpacityProps */

/**
 * @typedef {TextInputProps & Pick<TouchableOpacityProps, 'onPressIn' | 'onPress'> & { icon?: React.ReactElement, iconName?: string }} TextInputWithIconProps
 */

/** @type {React.ForwardRefExoticComponent<TextInputWithIconProps>} */
const TextInputWithIcon = React.forwardRef(
  ({editable: _editable, onPressIn, onPress, icon, iconName, style, ...props}, ref) => {
    const [isPressed, setPressed] = React.useState(false);
    const isFocused = useIsFocused();
    const editable = (_editable || _editable === undefined) && isFocused;

    if (!(icon || iconName)) {
      return (
        <TextInput style={[$S.textInput, styles.inputStyle, styles.greenOutline, style]}
                   editable={editable}
                   ref={ref}
                   {...props} />
      );
    }

    // This will throw a warning if the `icon` or `iconName` is null on first
    // render and subsequently non-null. So don't do that.

    const onPressInCb = React.useCallback(() => {
      setPressed(true);
      onPressIn && onPressIn();
    }, [onPressIn]);
    const onPressOutCb = React.useCallback(() => {
      setPressed(false);
    }, []);
    const sharedIconStyles = [styles.sharedIconStyle];

    return (
      <View>
        <TouchableOpacity
          onPressIn={onPressInCb}
          onPress={onPress}
          onPressOut={onPressOutCb}
          style={styles.touchableStyle}>
          {icon ?
           React.cloneElement(icon, { style: [sharedIconStyles, icon.props.style] }) :
           iconName ?
           <Ionicons size={30} style={[styles.iconStyle, sharedIconStyles]}
                     name={iconName} /> :
           null}
        </TouchableOpacity>
        <TextInput style={[$S.textInput, styles.inputStyle, isPressed ? styles.purpleOutline : styles.greenOutline, style]}
                   editable={editable}
                   ref={ref}
                   {...props} />
      </View>
    );
  });

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
