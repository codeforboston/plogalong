import * as React from 'react';
import {FlatList, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import * as $u from '../util/users';

import AchievementBadge from './AchievementBadge';
import AchievedTypes from '../constants/AchievedMockup';


const AchievementSwipe = ({achievements, showAll=false}) => {
  if (!achievements) achievements = {};
  const data = $u.processAchievements(achievements, {
    unstarted: showAll,
    hidden: showAll
  });

  const navigation = useNavigation();

  return (
    <FlatList
      data={data}
      renderItem={({ item }) =>
                  <AchievementBadge
                    achievement={item}
                    onPress={() => navigation.navigate('AchievementModal', { achievement: item })} />
                 }
      keyExtractor={item => item.key}
      pagingEnabled={true}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    >
    </FlatList>
  );
};

export default AchievementSwipe;
