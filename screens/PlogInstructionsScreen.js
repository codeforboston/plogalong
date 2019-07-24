import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import Instructions from '../components/Instructions';
import CameraSrc from '../assets/images/camera.png';
import Colors from '../constants/Colors';
import icons from '../icons';

const headingText = "Plog";
const images=[CameraSrc, CameraSrc, CameraSrc];
const iconList=[icons.Running, icons.Backpacker, icons.Dog, icons.Canoe, icons.Team];
const instructionText = "Clean up litter on the go: walking around, while you exercise, or with a group.";
const buttonText = "Got it!"
const linkText = "Skip intro";

export default class PlogInstructionScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Instructions 
            heading={headingText} 
            images={images} 
            iconList={iconList} 
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
