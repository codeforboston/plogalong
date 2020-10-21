import React from "react";
import {
  Text,
  View,
} from "react-native";

import $S from '../styles';

const DefaultBullet = <Text style={{ fontSize: 30, marginTop: -7 }}>{'\u2022'}</Text>;

export const LI = ({children, bullet=DefaultBullet}) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 }}>
    {React.cloneElement(bullet, { style: [bullet.props.style, { flex: 0, paddingRight: 10 }] })}
    <Text style={[$S.body, { marginBottom: 0 }]}>{children}</Text>
  </View>
);

export default LI;