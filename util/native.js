import {
  Alert,
  AsyncStorage,
} from 'react-native';


/**
 * @param {Parameters<typeof Alert.alert>} args
 */
export function asyncAlert(...args) {
  const [title, message, buttons, options] = args;

  return new Promise(resolve => {
    Alert.alert(title, message, buttons.map(({ onPress, ...b }) => ({
      ...b,
      onPress: () => {
        if (onPress)
          onPress(b.value);
        resolve(b.value);
      }
    })), options);
  });
}

export async function updateLocalStorage(key, update, initial=null) {
  let value = await AsyncStorage.getItem(key);

  if (value === null)
    value = initial;
  else
    value = JSON.parse(value);

  await AsyncStorage.setItem(key, JSON.stringify(update(value)));
}
