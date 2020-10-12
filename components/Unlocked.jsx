import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as RN from 'react-native';

import Colors from '../constants/Colors';

const iconProps = { fill: Colors.selectionColor, width: 75, height: 75 };

/**
 * @typedef {object} UnlockedProps
 *
 * @property {React.Component|JSX.Element} icon
 * @property {React.ReactNode} title
 * @property {React.ReactNode} description
 * @property {React.ReactNode} [bonusText]
 * @property {RN.StyleProp<RN.ViewStyle>} [style]
 * @property {RN.StyleProp<RN.TextStyle>} [titleStyle]
 */

/** @type {React.FunctionComponent<UnlockedProps>} */
export default (props => (
  <View style={[styles.container, props.style]}>
    {React.createElement(props.icon, iconProps)}
    <View style={styles.achievementText}>
      <Text style={[styles.title, props.titleStyle]}>{props.title}</Text>
      <Text style={styles.description}>{props.description}</Text>
      {props.bonusText && <Text style={styles.bonus}>{props.bonusText}</Text>}
    </View>
  </View>
));

const styles = StyleSheet.create({
  achievementText: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.selectionColor,
    padding: 20,
    margin: 5,
    flexDirection: 'row',
  },
  title: {
    color: Colors.selectionColor,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    color: "black",
    marginBottom: 5,
  },
  bonus: {
    color: "black",
    fontWeight: 'bold',
  }
});
