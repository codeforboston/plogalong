import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';

const { View } = Animated;

/**
 * @typedef {Object} ShowHideProps
 * @property {boolean} shown
 * @property {number} [shownValue=1]
 * @property {number} [hiddenValue=0]
 * @property {keyof StyleProp<ViewStyle>} [styleName='opacity']
 * @property {StyleProp<ViewStyle>} [style]
 * @property {StyleProp<ViewStyle>} [appearingStyle]
 * @property {StyleProp<ViewStyle>} [hidingStyle]
 * @property {Animated.TimingAnimationConfig} [animationConfig]
 */

/** @type {React.FunctionComponent<ShowHideProps>} */
export const ShowHide = props => {
  const {
    shown, shownValue = 1, hiddenValue = 0,
    animationConfig,
    styleName = 'opacity',
  } = props;
  const [isAnimating, setAnimating] = useState(false);
  const value = useRef(new Animated.Value(shown ?  shownValue : hiddenValue)).current;
  const running = useRef(null);

  useEffect(() => {
    if (running.current)
      running.current.stop();

    setAnimating(true);
    running.current = Animated.timing(value, {
      ...animationConfig,
      toValue: shown ? shownValue : hiddenValue,
    }).start(({ finished }) => {
      if (finished) {
        setAnimating(false);
        running.current = null;
      }
    });
  }, [!!shown]);

  return (
    <View style={[ props.style, { [styleName]: value },
                   isAnimating && (shown ? props.appearingStyle : props.hidingStyle )]}>
      {props.children}
    </View>
  );
};
