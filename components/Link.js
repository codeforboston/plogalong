import * as React from 'react';
import {
  Alert,
  Linking,
  Text,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import $S from '../styles';


const Link = ({children, style, ...props}) => (
  <Text style={[$S.link, style]} {...props}>
    {children}
  </Text>
);

export const A = ({ href, style, ...props }) => (
  <Text style={[$S.link, style]}
        {...props}
        onPress={React.useCallback(() => Linking.openURL(href), [href])} />
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

  return (
    <View style={$S.linkButton}>
      <Text style={$S.linkButtonText} onPress={handlePress}>
        {children}
      </Text>
    </View>
  );
};


export const NavLink = ({children, onPress: onPressOrig, pop, route, style, screen, params, ...props}) => {
  const navigation = useNavigation();
  const onPress = React.useCallback((_, e) => {
    if (pop) {
      navigation.pop();
    } else if (route) {
      navigation.navigate(route, screen ? { screen, params } : params);
    }

    return onPressOrig && onPressOrig(navigation, e);
  }, [onPressOrig, navigation, pop, route]);

  return (
    <Text {...props} style={[$S.link, style]} onPress={onPress}>
      {children}
    </Text>
  );
};

export default Link;
