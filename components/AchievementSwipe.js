import * as React from 'react';
import {FlatList, StyleSheet} from 'react-native';
import AchievementBadge from './AchievementBadge';
import AchievedTypes from '../constants/AchievedMockup';


function keep(fn, xs) {
  const result = [];
  for (const x of xs) {
    const val = fn(x);
    if (val) result.push(val);
  }
  return result;
}

class AchievementSwipe extends React.PureComponent {
    render() {
      const achievements = this.props.achievements || {};
      const data = keep(achType => {
        const a = achievements[achType];
        const {icon, progress, detailText, ...rest} = AchievedTypes[achType];

        const progressPercent = a.completed ? 100 : progress && a ? progress(a) : 0;

        if (!progressPercent) return null;

        return {
          progress: progressPercent,
          icon,
          key: achType,
          detailText: detailText && detailText(a),
          ...rest,
          ...a
        };
      }, Object.keys(achievements)).sort(
        ({updated: a, completed: ac}, {updated: b, completed: bc}) => (
          ac ? (bc ?
                (ac.toMillis() > bc.toMillis() ? -1 : 1)
                : -1)
            : (bc ? 1
               : (a ?
                  (b ? (a.toMillis() > b.toMillis() ? -1 : 1)
                   : -1)
                  : (b ? 1 : -1)))
        ));

        return (
            <FlatList
                data={data}
                renderItem={({item}) =>
                    <AchievementBadge
                      badgeImage={React.createElement(item.icon)}
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
