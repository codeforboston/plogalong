import React from 'react';

import {
    Text,
    TouchableOpacity,
} from 'react-native';

import $S from '../styles';


const Link = ({children, style, ...props}) => (
    <TouchableOpacity {...props}>
      <Text style={[$S.link, style]}>
        {children}
      </Text>
    </TouchableOpacity>
);

export default Link;
