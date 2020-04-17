import * as React from 'react';

import Colors from '../constants/Colors';
import AchievementTypes from '../constants/AchievedMockup';

import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp
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
      alignItems: 'center',
      marginRight: 10
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
  iconContainer: {
    width: 48,
    height: 48,
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

/**
 * @typedef {object} AchievementBadgeProps
 * @property {React.Component} badgeImage
 * @property {keyof typeof AchievementTypes} achievement
 * @property {Date} completed
 * @property {string} detailText
 * @property {number} points
 * @property {number} progressPercent
 * @property {string} textValue
 * @property {StyleProp<ViewStyle>} style
 */

/** @type {React.FunctionComponent<AchievementBadgeProps>} */
const AchievementBadge = props => {
  const {achievement, completed = null, detailText, points, progressPercent, style} = props;
  const badge = achievement && AchievementTypes[achievement];
  const detail = completed ? `+ ${points} points` : detailText;
  const badgeImage = props.badgeImage || (badge && badge.icon);
  const textValue = props.textValue || (badge && badge.badgeTheme);

  return (
    <View style={[styles.achieveBadge, completed && styles.completedBadge, style]}>
      <View style={styles.iconContainer}>
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
