import React from "react";
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {connect} from 'react-redux';

import {getStats} from '../util';

import AchievementSwipe from '../components/AchievementSwipe';
import Banner from '../components/Banner';
import Colors from '../constants/Colors';

export const AchievementScreen = ({currentUser}) => {

    const [isBadges, setIsBadges] = useState(true);

    const bonus = getStats(currentUser, 'total').bonusMinutes;
    let badgeCount = 0;
    for (const badge in currentUser.data.achievements) {
            if (currentUser.data.achievements[badge] != null && currentUser.data.achievements[badge].completed != null) {badgeCount += 1}
        }
    return (
        <View style={{margin: 15, padding: 0,}}>
        <Banner >
            You earned {badgeCount} badge{badgeCount === 1 ? '': 's'} and {bonus === undefined ? 0: bonus} bonus minute{bonus === 1 ? '': 's'}.
        </Banner>
        <View style={styles.toggle}>
        <TouchableWithoutFeedback onPress={() => setIsBadges(true)}>
            <View  style={isBadges ? styles.isBadges : styles.notBadges}>
                <Text style={{color: isBadges ? 'white' : Colors.secondaryColor}}>BADGES</Text>
            </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => setIsBadges(false)}>
            <View  style={!isBadges ? styles.isBadges : styles.notBadges}>
                <Text style={{color: !isBadges ? 'white' : Colors.secondaryColor}}>LEADERBOARD</Text>
            </View>
        </TouchableWithoutFeedback>
        </View>
        {isBadges ? (
            <AchievementSwipe
                achievements={currentUser.data.achievements}
                showAll={true}
                style={{marginTop: 25,}}
                numColumns={3}
                horizontal={false}
                inset={{paddingBottom: 120,}}
            />
        ) :
        (<Text style={{textAlign: 'center', fontSize: 18, marginTop: 20,}}>
            The Leaderboard is still under construction. Come back soon!
        </Text>)
        }
      </View>
    );
}

const styles = StyleSheet.create({
    isBadges: {
        backgroundColor: Colors.selectionColor,
        paddingVertical: 5,
        alignItems: 'center',
        width: '50%',
    },
    notBadges: {
        paddingVertical: 5,
        alignItems: 'center',
        width: '50%',
    },
    toggle: {
        flex: 0,
        flexDirection: 'row',
        borderColor: Colors.secondaryColor,
        borderRadius: 5,
        borderWidth: 1,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 0,
        marginTop: 15,
    },
});


export default connect(({users}) => {
    return {
      currentUser: users.current,
    };
  }, dispatch => ({
    loadHistory: (...args) => dispatch(actions.loadHistory(...args)),
  }))(AchievementScreen);
