import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';

import { times } from '../util';
import Dot from '../assets/images/dot.png';

const Image = Animated.Image;


const LoadingIndicator = ({dots = 3, dotImage=Dot, dotStyle=null, style=null, ...props}) => {
  const scale = useRef(times(dots, () => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel(
        scale.map((av, i) =>
                  Animated.sequence([
                    Animated.delay(i*125),
                    Animated.timing(av, { toValue: 1.5, duration: 250 }),
                    Animated.timing(av, { toValue: 0.5, duration: 250 }),
                    Animated.timing(av, { toValue: 1, duration: 250 }),
                    Animated.delay(125),
                  ]))
      )
    ).start();
  }, []);

  return (
    <View style={[styles.loading, style]} {...props}>
      {scale.map((sc, i) => <Image source={dotImage} key={i} style={[styles.dot, { transform: [{ scale: sc }] }, dotStyle]}/>)}
    </View>
  );
};

export const LoadingOverlay = ({children, ...props}) => (
  <View style={styles.overlay}>
    <View>
      {children}
      <LoadingIndicator {...props}/>
    </View>
  </View>
);

const styles = StyleSheet.create({
  loading: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  dot: {
    margin: 5
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    flexDirection: 'column',
    justifyContent: 'center',
  }
});

export default LoadingIndicator;
