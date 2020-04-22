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
import { TouchableOpacity } from 'react-native-gesture-handler';

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
      color: '#666666',
      textAlign: 'center',
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
 * @property {string} description
 * @property {StyleProp<ViewStyle>} style
 * @property {(e: any) => any} onPress
 */

/** @type {React.FunctionComponent<AchievementBadgeProps>} */
const AchievementBadgeComponent = props => {
  const {achievement, completed = null, detailText, points, progressPercent, style, onPress, description} = props;
  const badge = achievement && AchievementTypes[achievement];
  const detail = completed ? `+ ${points} bonus minutes` : detailText;
  const badgeImage = props.badgeImage || (badge && badge.icon);
  const textValue = props.textValue || (badge && badge.badgeTheme);

  const content = (
    <View style={[styles.achieveBadge, completed && styles.completedBadge, style]}>
      <View style={styles.iconContainer}>
        {React.createElement(badgeImage, { fill: completed ? Colors.selectionColor : '#666666' })}
      </View>
      <Text style={[styles.textLarger, completed ?
                    { color: Colors.selectionColor} : styles.inProgress]}>{textValue}</Text>
      {description && <Text style={styles.textSmaller}>{description}</Text>}
      {
        detail && <Text style={[styles.textSmaller,
                                completed ? { color: Colors.selectionColorLight } : styles.inProgress]}>{detail}</Text>
      }
    </View>
  );

  return onPress ? 
    <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity> :
    content;
};

const AchievementBadge = ({ achievement, showDescription = false, ...props}) => (
  <AchievementBadgeComponent
    badgeImage={achievement.icon}
    textValue={achievement.badgeTheme}
    points={achievement.points}
    completed={achievement.completed}
    progress={achievement.progress}
    detailText={achievement.detailText}
    description={showDescription && (achievement.completed ? achievement.description : achievement.incompleteDescription )}
    {...props}
  />
);

export default AchievementBadge;
