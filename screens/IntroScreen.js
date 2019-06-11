import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import Instructions from '../components/Instructions';
import PlogalongSrc from '../assets/images/plogalong.png';
import Colors from '../constants/Colors';

const singleImage = PlogalongSrc;
const paragraphs = "When you plog, you pick up trash as you go about your daily life.\n\nPlogalong helps you track and share your plogs, and connect with other ploggers in your neighborhood."
const buttonText = "Let's Plog!";

export default class IntroScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Instructions 
            singleImage={singleImage}
            paragraphs={paragraphs}
            buttonText={buttonText}
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
