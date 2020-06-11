import * as React from 'react';
import {
  Alert,
  Button as RNButton,
  Linking,
  Text,
  TouchableOpacity,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import $S from '../styles';


const Link = ({children, style, ...props}) => (
  <TouchableOpacity {...props}>
    <Text style={[$S.link, style]}>
      {children}
    </Text>
  </TouchableOpacity>
);

export const A = ({ href, ...props }) => (
  <Text style={$S.link} {...props} onPress={() => Linking.openURL(href) } />
);

// https://reactnative.dev/docs/linking
export const OpenURLButton = ({ url, children }) => {
  const handlePress = React.useCallback(async () => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, [url]);

  return <RNButton title={children} onPress={handlePress} />;
};


export const NavLink = ({children, onPress: onPressOrig, pop, route, style, screen, params, ...props}) => {
  const navigation = useNavigation();
  let onPress;
  if (pop)
    onPress = (_, e) => {
      navigation.pop();
      return onPressOrig && onPressOrig(navigation, e);
    };
  else if (route)
    onPress = (_, e) => {
      navigation.navigate(route, screen ? { screen, params } : params);
      return onPressOrig && onPressOrig(navigation, e);
    };

  return (
    <Text {...props} style={[$S.link, style]} onPress={onPress}>
      {children}
    </Text>
  );
};

export default Link;
