import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Colors from '../constants/Colors';


const Banner = (props) => (
    <Text style={[styles.container, props.style]}>
      {props.children}
    </Text>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bannerBackground,
        borderColor: Colors.borderColor,
        borderWidth: 1,
        marginLeft: 20,
        marginRight: 20,
        padding: 5,
        textAlign: 'center'
    },
});

export default Banner;
