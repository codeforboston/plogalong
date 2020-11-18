import * as React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Colors from '../constants/Colors';

const Header = ({icon, text}) => (
    <View style={styles.container}>
      {icon && (typeof icon === 'number' || icon.uri ? <Image source={icon}  /> : React.createElement(icon, { width: 25, height: 25, fill: Colors.selectionColor}))}
        <Text style={styles.headerText}>{ text }</Text>
    </View>
);


const styles = StyleSheet.create({
  container: {
      // flex: 1,
      flexDirection: 'row',
      justifyContent: 'center'
  },

    headerText: {
        alignSelf: 'center',
        color: Colors.activeColor,
        marginLeft: 7,
        fontSize: 16
    },
});


export default Header;
