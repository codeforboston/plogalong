import * as React from 'react';
import * as Notifications from 'expo-notifications';

import AsyncStorage from '@react-native-community/async-storage';
import CachingImage from '../components/Image';

const ONE_HOUR =  60 * 60;

let scheduledNotificationId;

const initialTimerState = {
  started: null,
  time: 0,
  loaded: false,
};

const scheduleLocalNotification = async (time) => {
    // Only schedule local notification if time spent plogging when starting timer is less than 1 hour.
    const timeUntilOneHour = ONE_HOUR - time;
    scheduledNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hey Plogger!",
        body: "You've been plogging for an hour. Don't forget to log your journey!",
      },
      trigger: { seconds: timeUntilOneHour },
    });
};

const cancelScheduledNotification = async (notificationId) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  scheduledNotificationId = null; 
};

export const useTimer = (init=initialTimerState, store='com.plogalong.plogalong.plogTimer') => {
  const [timerState, updateTimer] =
        React.useState(() => ({ ...init, tick: 0 }));
  const intervalRef = React.useRef();

  const methods = React.useMemo(() => {
    const run = (action='toggle', payload=null) => {
      updateTimer(state => {
        if (action === 'toggle')
          action = state.started ? 'stop' : 'start';
        
        let newState = state;
        switch (action) {
        case 'start': {
          clearInterval(intervalRef.current);
          const interval = setInterval(() => {
            updateTimer(state => ({
              ...state,
              tick: state.tick+1
            }));
          }, 1000);
          const timeInSeconds = state.time / 1000;
          if (timeInSeconds < ONE_HOUR) {
            scheduleLocalNotification(timeInSeconds);
          };
          intervalRef.current = interval;

          newState = Object.assign({
            time: state.time,    // may be overriden by payload
            started: state.started || Date.now(), // ^
            tick: 0,
            loaded: true,
          }, payload);
          break;
        }

        case 'stop': {
          if (!state.started) break;

          const time = state.time + (Date.now() - state.started);
          clearTimeout(intervalRef.current);
          cancelScheduledNotification(scheduledNotificationId);
          newState = {
            ...state,
            started: null,
            time,
          };
          break;
        }

        case 'reset':
          clearTimeout(intervalRef.current);
          newState = { ...initialTimerState, tick: 0 };
          break;
        }

        if (newState === state)
          return state;

        AsyncStorage.setItem(store, JSON.stringify({ time: newState.time, started: newState.started }));
        return newState;
      });
    };

    return {
      start: (payload=null) => run('start', payload),
      stop: () => run('stop'),
      toggle: () => run('toggle'),
      reset: () => run('reset'),
    };
  }, []);

  React.useEffect(() => {
    AsyncStorage.getItem(store).then(JSON.parse).then(
      timer => {
        if (!timer) {
          updateTimer(state => ({ ...state, loaded: true }));
          return;
        }

        const {started, time} = timer;
        if (started)
          methods.start({ started, time });
        else
          updateTimer(state => ({ ...state, time, loaded: true }));
      },
      () => {}
    );

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return {
    total: timerState.time + (timerState.started ? Date.now() - timerState.started : 0),
    started: timerState.started,
    loaded: timerState.loaded,
    ...methods
  };
};

export default useTimer;
