import * as React from 'react';
import { useSelector } from 'react-redux';
import {
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

import { formatDateOrRelative } from '../util/string';
import { processAchievement } from '../util/users';

import $S from '../styles';

import AchievementBadge from "../components/AchievementBadge";
import Button from '../components/Button';


const AchievementModal = ({navigation, route}) => {
  const { params: { achievementType } } = route;
  const currentUser = useSelector(state => state.users.current);
  const { data: { achievements = {} } = {} } = currentUser || {};
  const achievement = processAchievement(achievements, achievementType);

  return (
    <View style={$S.modalContainer}>
      <View style={[$S.modalContent, styles.modalContent]}>
        <Text style={$S.headline}>
          {achievement.completed ? 'Achievement Unlocked!' : 'Keep on Plogging'}
        </Text>
        <AchievementBadge
          achievement={achievement}
          showDescription
          style={styles.badgeStyle}
        />
        {achievement.completed &&
         <Text style={$S.body}>
           Completed {formatDateOrRelative(achievement.completed.toDate())}
         </Text>}
      {/*  <View style={styles.shareOptions} >
          <Text>Share on Facebook</Text>
          <Switch value={false} />
        </View> */}
      </View>
      <View style={$S.modalButtonsContainer}>
        <Button
          title="OK" onPress={_ => { navigation.navigate('History'); /* XXX Cheat */}} 
          large
          style={$S.modalButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    modalContent: {
        justifyContent: 'space-between',
    },
    shareOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    badgeStyle: {
        alignSelf: 'center',
        backgroundColor: '#D8DCE7',
        width: '80%',
        margin: 30,
    }
});

export default AchievementModal;
