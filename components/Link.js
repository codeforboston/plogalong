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

export const NavLink = ({children, onPress, pop, route, style, ...props}) => {
    const navigation = useNavigation();
    onPress = onPress && onPress.bind(null, navigation);
    const onPressOrig = onPress;
    if (pop)
        onPress = (_, e) => {
            navigation.pop();
            return onPressOrig && onPressOrig(navigation, e);
        };
    if (route)
        onPress = (_, e) => {
            navigation.navigate(route);
            return onPressOrig && onPressOrig(navigation, e);
        };

    return (
        <TouchableOpacity {...props} onPress={onPress}>
          <Text style={[$S.link, style]}>
            {children}
          </Text>
        </TouchableOpacity>
    );
};

export default Link;
