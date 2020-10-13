import * as React from 'react';
import { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback
} from 'react-native';
import * as RN from 'react-native';

import Colors from '../constants/Colors';
import $S from '../styles';


const makeToggle = (init) => {
  const [active, setActive] = useState(init);
  return {
    active,
    turnOn: () => setActive(true),
    turnOff: () => setActive(false),
  };
};

/**
 * @typedef {object} ExtraButtonProps
 *
 * @property {React.Component|JSX.Element} icon
 * @property {React.Component|JSX.Element} activeIcon
 * @property {React.Component|JSX.Element} selectedIcon
 * @property {RN.StyleProp<RN.ViewStyle>} [style]
 * @property {boolean} disabled
 * @property {boolean} large
 * @property {boolean} primary
 * @property {string} [title]
 * @property {boolean} selected
 */

/** @typedef {ExtraButtonProps & React.ComponentProps<typeof TouchableWithoutFeedback>} ButtonProps */

export default /** @type {React.FunctionComponent<ButtonProps>} */ (props => {
  const {accessibilityLabel, icon, activeIcon, disabled, large, primary, title, selected, selectedIcon, style, onLayout, onPress, ...otherProps} = props,
        {active, turnOn: onPressIn, turnOff: onPressOut} = makeToggle(),
        sharedStyles = [$S.button, primary && $S.primaryButton,
                        disabled ? styles.disabled : (active && $S.activeButton),
                        selected && styles.selected,
                        large && $S.largeButton];

  let content;

  if (icon) {
    const shownIcon = (selected && selectedIcon) || (active && activeIcon) || icon,
          iconComponent = typeof shownIcon === 'function' ?
          React.createElement(shownIcon, {style: styles.iconStyles}) :
          React.cloneElement(shownIcon, {style: [styles.iconStyles, shownIcon.props.style]});

    content = (
      <View style={[...sharedStyles, styles.iconButton, style]} onLayout={onLayout}>
        {iconComponent}
      </View>
    );
  } else if (title) {
    content = (
      <Text style={[...sharedStyles, $S.textButton, style]} onLayout={onLayout}>
        {title}
      </Text>
    );
  }

  return (
    <TouchableWithoutFeedback accessibilityLabel={accessibilityLabel || title}
                              accessibilityRole="button"
                              accessibilityState={{selected: !!selected, disabled }}
                              onPressIn={!disabled ? onPressIn : null}
                              onPressOut={!disabled ? onPressOut : null}
                              onPress={!disabled ? onPress : null}
                              {...otherProps}>
      {content}
    </TouchableWithoutFeedback>
  );
});


const styles = StyleSheet.create({
    disabled: {
        opacity: 0.8
    },

    iconButton: {
        width: 50,
        height: 50,
    },

    selected: {
        borderColor: Colors.selectionColor
    },

    iconStyles: {
        flex: 1
    }
});
