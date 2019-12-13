import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Colors from '../constants/Colors';

const HistoryBanner = () => {
    return (
        <View style={{paddingTop: 30}}>
            <Text style={styles.bannerHistory}>
                You plogged ??? times this month.
                {'\n'}
                You earned ??? plogging minutes and ??? badges.
            </Text>
        </View>
    )
};

const styles = StyleSheet.create({
    bannerHistory: {
        backgroundColor: Colors.bannerBackground,
        borderColor: Colors.borderColor,
        borderWidth: 1,
        marginLeft: 20,
        marginRight: 20,
        padding: 5,
        textAlign: 'center'
    }
});

export default HistoryBanner;