import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import Instructions from '../components/Instructions';
import CameraSrc from '../assets/images/camera.png';
import PlaceholderBadgeSrc from '../assets/images/placeholderBadge.png';
import Colors from '../constants/Colors';

const headingText = "Save the Earth";
const images=[CameraSrc, CameraSrc, CameraSrc];
const placeholderBadge = PlaceholderBadgeSrc;
const instructionText = "Lead by example.\nEvery little bit helps.\nA clean earth begins with you.";
const buttonText = "I'm ready!";
const linkText = "Skip intro";

export default class SaveTheEarthScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Instructions 
            heading={headingText}
            images={images} 
            placeholderBadge={placeholderBadge}
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
