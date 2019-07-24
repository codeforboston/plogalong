import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import Instructions from '../components/Instructions';
import LogInstructionsMapSrc from '../assets/images/logInstructionsMap.jpg';
import Colors from '../constants/Colors';

const headingText = "Log";
const singleImage = LogInstructionsMapSrc;
const instructionText = "Share with fellow ploggers.\nSee where others are plogging.\nGet local discounts.";
const buttonText = "I'm psyched!"
const linkText = "Skip intro";

export default class LogInstructionScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Instructions 
            heading={headingText} 
            singleImage = {singleImage}
            instructionText={instructionText}
            buttonText={buttonText}
            linkText={linkText}
          /> 
        </ScrollView>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.selectionColor,
  },
  contentContainer: {
    paddingTop: 30,
  },
});
