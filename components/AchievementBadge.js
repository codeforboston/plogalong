import React from 'react';

import Colors from '../constants/Colors';

import {
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const styles = StyleSheet.create({
    achieveBadge: {
        width: 150,
        height: 150,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        backgroundColor: '#f1ecf8', // based on Colors.selectionColor #8354c5
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textLarger: {
        fontSize: 18,
        color: '#ac8dd8', // based on Colors.selectionColor
        fontWeight: 'bold'
    },
    textSmaller: {
        fontSize: 12,
        color: '#ac8dd8', // based on Colors.selectionColor
        fontWeight: 'bold'
    }
});

function AchievementBadge(props) {
    return (
        <View style={styles.achieveBadge}>
            <Image
                style={{width: 24, height: 24}}
                source={{uri: props.badgeImage}}
            />
            <Text style={styles.textLarger}>{props.textValue}</Text>
            <Text style={styles.textSmaller}>+ {props.plogPoints} points</Text>
        </View>
    )
};

export default AchievementBadge;
/*
export default class AchievementBadge extends React.Component {
    render() {
        
    }
}
*/