import React, { useCallback, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback
} from 'react-native';

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

export default props => {
  const {accessibilityLabel, icon, activeIcon, disabled, large, primary, title, selected, selectedIcon, style, ...otherProps} = props,
        {active, turnOn: onPressIn, turnOff: onPressOut} = makeToggle(),
        sharedStyles = [$S.button, !disabled && active && $S.activeButton,
                        disabled && styles.disabled, selected && styles.selected,
                        primary && $S.primaryButton, (large || primary) && $S.largeButton];

  let content;

  if (icon) {
    const shownIcon = (selected && selectedIcon) || (active && activeIcon) || icon,
          iconComponent = typeof shownIcon === 'function' ?
          React.createElement(shownIcon, {style: styles.iconStyles}) :
          React.cloneElement(shownIcon, {style: [styles.iconStyles, shownIcon.props.style]});

    content = (
      <View style={[...sharedStyles, styles.iconButton, style]}>
        {iconComponent}
      </View>
    );
  } else if (title) {
    content = (
      <Text style={[...sharedStyles, $S.textButton, style]}>
        {title}
      </Text>
    );
  }

  if (disabled)
    return content;

  return (
    <TouchableWithoutFeedback accessibilityLabel={accessibilityLabel || title}
                              accessibilityRole="button"
                              accessibilityState={{selected: !!selected}}
                              onPressIn={onPressIn}
                              onPressOut={onPressOut}
                              {...otherProps}>
      {content}
    </TouchableWithoutFeedback>
  );
};


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
