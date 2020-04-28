import * as React from 'react';
import {
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

import AchievementBadge from "../components/AchievementBadge";
import AchievementTypes from '../constants/AchievedMockup';
import Colors from '../constants/Colors';
import $S from '../styles';
import Button from '../components/Button';


const AchievementModal = ({navigation, route}) => {
    const { params: { achievement } } = route;

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
                <View style={styles.shareOptions} >
                    <Text>Share on Facebook</Text>
                    <Switch value={false} />
                </View>
            </View>
            <View style={$S.modalButtonsContainer}>
                <Button
                    title="OK" onPress={navigation.goBack.bind(navigation)} 
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