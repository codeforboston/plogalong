import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const Header = (props) => (
    <View style={styles.container}>
        <Image source={props.icon}  />
        <Text style={styles.headerText}>{ props.text }</Text>
    </View>
);


const styles = StyleSheet.create({
  container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center'
  },

    headerText: {
        alignSelf: 'center',
        color: 'purple',
        marginLeft: 7,
        fontSize: 16
    },
});


export default Header;
