import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
} from 'react-native';

import { Queue, wait } from './util/async';
import { useSelector } from './redux/hooks';
import Colors from './constants/Colors';


const FlashMessage = () => {
  const { message, paused } = useSelector(({ ui }) => ({
    message: ui.flashMessage,
    paused: ui.paused
  }))
  const opacity = useRef(new Animated.Value(0)).current;
  const queue = useRef(/** @type {Queue<{ text: string, stamp: number, options?: any }>} */(null));

  const [text, setText] = useState(null);

  useEffect(() => {
    queue.current = new Queue();
    const q = queue.current;

    q.loop(async message => {
      setText(message.text);
      await new Promise(resolve => {
        Animated.timing(opacity, { toValue: 1, useNativeDriver: true }).start(resolve);
      });
      await wait(3000);
      await new Promise(resolve => {
        Animated.timing(opacity, { toValue: 0, useNativeDriver: true }).start(resolve);
      });
    });

    return () => q.done();
  }, []);

  useEffect(() => {
    if (message && queue.current)
      queue.current.push(message);
  }, [message]);

  if (paused)
   return null;

  return (
    <Animated.Text style={[styles.flashMessage, { opacity }]}
                   allowFontScaling
                   adjustsFontSizeToFit>
      {text}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  flashMessage: {
    backgroundColor: Colors.activeColor,
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    position: 'absolute',
    top: 50,
    padding: 10,
    width: '100%',
  }
});

export default FlashMessage;
