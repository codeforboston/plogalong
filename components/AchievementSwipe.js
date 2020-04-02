import * as React from 'react';
import {FlatList, StyleSheet} from 'react-native';

import { keep } from '../util';
import * as $u from '../util/users';

import AchievementBadge from './AchievementBadge';
import AchievedTypes from '../constants/AchievedMockup';


class AchievementSwipe extends React.PureComponent {
    render() {
      const achievements = this.props.achievements || {};
      const data = $u.processAchievements(achievements);

        return (
            <FlatList
                data={data}
                renderItem={({item}) =>
                    <AchievementBadge
                      badgeImage={item.icon}
                      textValue={item.badgeTheme}
                      points={item.points}
                      completed={item.completed}
                      progress={item.progress}
                      detailText={item.detailText}
                    />
                }
                keyExtractor={item => item.key}
                pagingEnabled={true}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
            </FlatList>
        );
    }
}

export default AchievementSwipe;
