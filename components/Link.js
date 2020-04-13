import * as React from 'react';
import {
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
