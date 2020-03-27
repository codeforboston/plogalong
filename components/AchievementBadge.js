import * as React from 'react';

import Colors from '../constants/Colors';

import {
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
      marginRight: 10,
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

function AchievementBadge({badgeImage, completed, detailText, points, progressPercent, textValue}) {
  const detail = completed ? `+ ${points} points` : detailText;

    return (
        <View style={styles.achieveBadge}>
            <View style=
                {{
                    width: 48,
                    height: 48,
                    color: '#ac8dd8'
                }}
            >
                {badgeImage}
            </View>
            <Text style={styles.textLarger}>{textValue}</Text>
          {
            detail && <Text style={styles.textSmaller}>{detail}</Text>
          }
        </View>
    );
};

export default AchievementBadge;
