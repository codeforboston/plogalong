import {
  Alert,
  AlertButton,
  AlertOptions,
} from 'react-native';


/**
 * @param {Parameters<typeof Alert.alert>} args
 * @param {string} title
 * @param {string} message
 * @param {(AlertButton & { value?: any })}
 * @param 
 */
export function asyncAlert(...args) {
  const [title, message, buttons, options] = args;

  return new Promise(resolve => {
    Alert.alert(title, message, buttons.map(({ onPress, ...b }) => ({
      ...b,
      onPress: value => {
        if (onPress)
          onPress(b.value);
        resolve(b.value);
      }
    })), options);
  });
}
