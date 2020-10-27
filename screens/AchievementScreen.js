import React from "react";
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import * as actions from '../redux/actions';
import {connect} from 'react-redux';
import { useDispatch, useSelector } from '../redux/hooks';
import { shallowEqual } from 'react-redux';
import { getStats, calculateTotalPloggingTime, formatCompletedBadges, calculateCompletedBadges, formatPloggingMinutes } from '../util';

import $S from '../styles';
import AchievementSwipe from '../components/AchievementSwipe';
import Banner from '../components/Banner';
import Colors from '../constants/Colors';
import Leaderboard from '../screens/Leaderboard';


export const AchievementScreen = ({currentUser }) => {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(actions.loadLocalHistory());
      }, []);

    const { region } = useSelector(({ log }) => {
        return {
          region: log.region,
        };
      }, shallowEqual);

    const [isBadges, setIsBadges] = useState(true);

    const stats = getStats(currentUser, 'total');

    return (
      <View style={{margin: 15, padding: 0,}}>
        <Banner >
            {stats.count === 0 
                ? "Plog something to earn your first badge!" 
                : `You earned ${formatCompletedBadges(calculateCompletedBadges(currentUser.data.achievements))} and \n ${formatPloggingMinutes(calculateTotalPloggingTime(stats))}!`
            }
        </Banner>
        <View style={styles.toggle}>
            <View style={styles.spacer}></View>
            <TouchableWithoutFeedback onPress={() => setIsBadges(true)}>
                <View  style={isBadges ? styles.isBadges : styles.notBadges}>
                    <Text style={{color: isBadges ? 'white' : Colors.secondaryColor}}>BADGES</Text>
                </View>
            </TouchableWithoutFeedback>
            <View style={styles.spacer}></View>
            {/*
            <TouchableWithoutFeedback onPress={() => setIsBadges(false)}>
                <View  style={!isBadges ? styles.isBadges : styles.notBadges}>
                    <Text style={{color: !isBadges ? 'white' : Colors.secondaryColor}}>LEADERBOARD</Text>
                </View>
            </TouchableWithoutFeedback>
            */}
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
            region 
            &&
            <>
                <View style={{ height: '100%' }}>
                    <Leaderboard regionID={region.id} style={$S.subheadLink}/>
                </View>
            </>        
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
        borderColor: Colors.secondaryColor,
        borderRadius: 5,
        borderWidth: 1,
    },
    notBadges: {
        paddingVertical: 5,
        alignItems: 'center',
        width: '50%',
        borderColor: Colors.secondaryColor,
        borderRadius: 5,
        borderWidth: 1,
    },
    toggle: {
        flex: 0,
        flexDirection: 'row',
        /*
        borderColor: Colors.secondaryColor,
        borderRadius: 5,
        borderWidth: 1,
        */
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 0,
        marginTop: 15,
    },
    spacer: {
        width: '25%',
    },
});


export default connect(({users}) => {
    return {
      currentUser: users.current,
    };
  }, dispatch => ({
    loadHistory: (...args) => dispatch(actions.loadHistory(...args)),
  }))(AchievementScreen);
