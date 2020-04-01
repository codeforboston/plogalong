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
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
  completedBadge: {
    borderColor: Colors.selectionColor,
  },
  completed: {
    color: Colors.selectionColor
  },
  inProgress: {
    color: '#666666',
  },
    textLarger: {
        fontSize: 18,
      fontWeight: 'bold',
      color: '#666666'
    },
    textSmaller: {
        fontSize: 12,
        color: '#ac8dd8', // based on Colors.selectionColor
      fontWeight: 'bold',
    }
});

function AchievementBadge({badgeImage, completed, detailText, points, progressPercent, textValue}) {
  const detail = completed ? `+ ${points} points` : detailText;

    return (
      <View style={[styles.achieveBadge, completed && styles.completedBadge]}>
            <View style=
                {{
                    width: 48,
                    height: 48,
                    color: '#666666'
                }}
            >
              {React.createElement(badgeImage, { fill: completed ? Colors.selectionColor : '#666666' })}
            </View>
        <Text style={[styles.textLarger, completed ?
                      { color: Colors.selectionColor} : styles.inProgress]}>{textValue}</Text>
          {
            detail && <Text style={[styles.textSmaller,
                                    completed ? { color: Colors.selectionColorLight } : styles.inProgress]}>{detail}</Text>
          }
        </View>
    );
};

export default AchievementBadge;
