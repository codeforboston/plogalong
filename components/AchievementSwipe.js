import * as React from 'react';
import {FlatList, StyleSheet} from 'react-native';
import AchievementBadge from './AchievementBadge';
import AchievedMockup from '../constants/AchievedMockup';

class AchievementSwipe extends React.Component {
    render() {
        return (
            <FlatList
                data={AchievedMockup} /* will be {AchievedData} */
                renderItem={({item}) => 
                    <AchievementBadge
                        style={styles.swipeLR}
                        badgeImage={item.pic}
                        textValue={item.badgeTheme}
                        plogPoints={item.points}
                    />
                }
                keyExtractor={item => item.key}
                pagingEnabled={true}
                horizontal={true}
            >
            </FlatList>
        )
    }
}

const styles = StyleSheet.create({
    swipeLR: {
        padding: 5
    }
});

export default AchievementSwipe;
