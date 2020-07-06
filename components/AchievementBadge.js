import * as React from 'react';

import { empty } from '../util/iter';
import Colors from '../constants/Colors';
import AchievementTypes from '../constants/AchievedMockup';

import {
  PixelRatio,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';

/** @typedef {import('../util/users').AchievementInstance} AchievementInstance */
/** @typedef {React.ComponentProps<typeof TouchableOpacity>} TouchableProps */
/**
 * @typedef {object} AchievementBadgeProps
 * @property {React.Component} badgeImage
 * @property {AchievementInstance} achievement
 * @property {Date} completed
 * @property {string} detailText
 * @property {number} points
 * @property {number} progress
 * @property {string} textValue
 * @property {string} description
 * @property {StyleProp<ViewStyle>} style
 */

/** @type {React.FunctionComponent<AchievementBadgeProps & TouchableProps>} */
export const AchievementBadgeComponent = ({achievement, completed = null, detailText, points, progress, style, description, badgeImage, textValue, ...touchableProps}) => {
  const detail = completed ? `+ ${points} minutes` : detailText;

  if (!textValue) textValue = achievement.badgeTheme;

  const content = (
    <View style={[styles.achieveBadge, completed && styles.completedBadge, style]}>
      {badgeImage &&
       <View style={styles.iconContainer}>
         {React.createElement(badgeImage, { fill: completed ? Colors.selectionColor : '#666666', width: '100%', height: '100%' })}
       </View>}
      <Text style={[styles.textLarger, completed ?
                    { color: Colors.selectionColor} : styles.inProgress]}
      >
        {textValue}
      </Text>
      {description && <Text style={styles.textSmaller}>{description}</Text>}
      {
        detail && <Text style={[styles.textSmaller,
                                completed ? { color: Colors.selectionColorLight } : styles.inProgress]}>{detail}</Text>
      }
    </View>
  );

  return (
    <TouchableOpacity {...touchableProps} disabled={empty(touchableProps)}>
      {content}
    </TouchableOpacity>
  );
};

const AchievementBadge = ({ achievement, showDescription = false, ...props}) => {
  if (typeof achievement === 'string')
    achievement = AchievementTypes[achievement];

  const hideIcon = PixelRatio.getFontScale() > 1.6;

  return (
    <AchievementBadgeComponent
      achievement={achievement}
      badgeImage={!hideIcon && achievement.icon}
      points={achievement.points}
      completed={achievement.completed}
      progress={achievement.progress}
      detailText={achievement.detailText}
      description={showDescription && (achievement.completed ? achievement.description : achievement.incompleteDescription )}
      {...props}
    />
  );
};

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
    textAlign: 'center',
    color: Colors.textGray,
  },
  textSmaller: {
    fontSize: 12,
    color: '#ac8dd8', // based on Colors.selectionColor
    fontWeight: 'bold',
  }
});

export const BadgeWidth = styles.achieveBadge.width + styles.achieveBadge.marginRight;

export default AchievementBadge;
