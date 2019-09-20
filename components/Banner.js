import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Colors from '../constants/Colors';

import plogMessage from '../screens/PlogScreenWeather';

const Banner = (props) => (
    <View>
        <Text style={styles.container}>
            {props.children}{plogMessage.message}
        </Text>
    </View>
);

export default Banner;

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
    contentContainer: {
        paddingTop: 30,
    },
});
