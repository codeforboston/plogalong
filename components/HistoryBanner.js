import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Colors from '../constants/Colors';
import AchievedMockup from '../constants/AchievedMockup';

const HistoryBanner = () => {
    let numberOfBadges = AchievedMockup.length;
    let numberOfPlogs = 55; // this is a placeholder value
    let plogMinutesTotal = numberOfPlogs * 25; /* this is a placeholder value, 
    assuming an average of 25 minutes per plog.

    A better calculation might be as follows: 

    `userJSON` would be the main object associated with a single user in Firebase.
    `plogObject` would be a variable for any individual plog record object within `userJSON`.
    `minutes` would be the property within each `plogObject` that holds a value of minutes spent on that plog.

    let minutesArray = userJSON.map((userJSON.plogObject) => {
        minutesArray.push(userJSON.plogObject.minutes)
    });
    let reducer = (accum, curVal) => {accum + curVal};
    let plogMinutesTotal = minutesArray.reduce(reducer);

    */
    let plogsThisMonth = 5; // this is also a placeholder value
    return (
        <View style={{paddingTop: 30}}>
            <Text style={styles.bannerHistory}>
                You plogged {plogsThisMonth} times this month.
                {'\n'}
                You earned {plogMinutesTotal} plogging minutes and {numberOfBadges} badges this year.
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