import * as React from 'react';
import {
    Switch
} from 'react-native';

import C from '../constants/Colors';
import $S from '../styles';


/**
 * @type {React.FC<import('react-native').SwitchProps>}
 */
const Toggle = ({ style, ...props }) =>
    <Switch trackColor={{ true: C.secondaryColor }} 
            style={[$S.switch, style]} 
            {...props}
     />;

export default Toggle;