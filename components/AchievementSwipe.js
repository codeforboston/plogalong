import * as React from 'react';
import {
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import * as $u from '../util/users';

import AchievementBadge, { BadgeWidth } from './AchievementBadge';


const AchievementSwipe = ({achievements, showAll=false, style, horizontal=true, numColumns=1}) => {
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
                    onPress={() => navigation.navigate('AchievementModal', { achievementType: item.key })}
                    accessibilityLabel="Achievement details"
                    accessibilityHint="Click to view achievement details"
                    accessibilityRole="button"
                    imageOnly={!horizontal}
                  />
                 }
      keyExtractor={item => item.key}
      pagingEnabled={true}
      horizontal={horizontal}
      numColumns={numColumns}
      snapToAlignment="start"
      snapToInterval={BadgeWidth}
      showsHorizontalScrollIndicator={false}
      style={style}
    />
  );
};

export default AchievementSwipe;
