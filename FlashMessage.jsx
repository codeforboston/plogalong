import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { connect } from 'react-redux';

import { Queue, wait } from './util/async';
import Colors from './constants/Colors';


const FlashMessage = ({ message }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const queue = useRef(/** @type {Queue<{ text: string, stamp: number, options?: any }>} */(null));

  const [text, setText] = useState(null);

  useEffect(() => {
    queue.current = new Queue();
    const q = queue.current;

    q.loop(async message => {
      setText(message.text);
      await new Promise(resolve => {
        Animated.timing(opacity, { toValue: 1 }).start(resolve);
      });
      await wait(3000);
      await new Promise(resolve => {
        Animated.timing(opacity, { toValue: 0 }).start(resolve);
      });
    });

    return () => q.done();
  }, []);

  useEffect(() => {
    if (message && queue.current)
      queue.current.push(message);
  }, [message]);

  return (
    <Animated.Text style={[styles.flashMessage, { opacity }]}>
      {text}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  flashMessage: {
    backgroundColor: Colors.activeColor,
    color: 'white',
    position: 'absolute',
    top: 50,
    padding: 10,
    width: '100%',
  }
});

export default connect(
  ({ui}) => ({ message: ui.flashMessage })
)(FlashMessage);
