import * as React from 'react';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import Header from '../components/Header';
import icons from '../icons';
import Arrow from '../assets/svg/headerBackImage/arrow.svg';

import $C from '../constants/Colors';


export default (route) => ({
  headerBackTitle: ' ',
  headerBackImage: () => <Arrow fill={$C.activeColor} />,
  title: getFocusedRouteNameFromRoute(route),
  headerTitle: (props) => (
    <Header text={props.children} icon={icons[props.children]} />)
,
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: '#fff',
    borderBottomColor: $C.activeColor,
    borderBottomWidth: 4,
  },
})
