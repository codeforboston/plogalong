import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import AchievementBadge from './AchievementBadge';
import AchievedData from '../constants/AchievedData';
import AchievedMockup from '../constants/AchievedMockup';

class AchievementSwipe extends React.Component {
    render() {
        return (
            <FlatList
                data={[AchievedMockup]} /* will be {[AchievedData]} */
                renderItem={({item}) => <View style={styles.swipeLR}>
                        <AchievementBadge
                            badgeImage={item.pic}
                            textValue={item.key}
                            plogPoints={item.points}
                        />
                    </View>
                }
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