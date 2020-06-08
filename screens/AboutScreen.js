import React, { useCallback } from "react";
import { StyleSheet, Text, View, Button, Linking } from "react-native";
import Link from '../components/Link';
import $S from '../styles';

const websiteURL = "https://www.plogalong.com/";
const mainMessage =
  "Plogalong helps you track your plogs, connect with nearby ploggers, earn badges, and access local discounts.";
const createdBy =
  "Plogalong is currently in the development stage at Code for Boston Hack Nights and Hackathon.";


const OpenURLButton = ({ url, children }) => {
  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, [url]);

  return (
    <View style={$S.linkButton}>
      <Button title="Visit plogalong.com" onPress={handlePress}/>
    </View>
  );
};

export default class AboutScreen extends React.Component {
  static navigationOptions = {
    title: "About Plogalong",
  };

  render() {
    return (
      <View style={$S.container}>
        <View style={$S.bodyContainer}>
        {/* About Plogalong */}

          <Text style={$S.body}>
            When you plog, you pick up trash as you go about your daily life... jogging, hiking, or simply walking down the street. Ploggers help keep our neighborhoods, parks, and oceans clean.
          </Text>
          <Text style={$S.body}>
            Plogalong helps you track your plogging history and see who else is plogging nearby. Stay motivated by earning badges and plogging minutes, or sharing your plogs on social media.
          </Text>
          <Text style={$S.body}>
            Plogalong was designed by Slipper Studios (link to slipperstudios.com), and was built as an open source civic project at Code for Boston (link to C4B).
          </Text>
          <Text style={$S.body}>
            Like Us on Facebook (https://www.facebook.com/Plogalong-100585405000063/)
          </Text>
        </View>
        {/* Lines 33-35 can be changed into a custom component*/}

        <OpenURLButton url={websiteURL}/>

        {/*
        <Link 
          //onPress={handlePress}
          style={$S.linkButton}
        >
          Visit plogalong.com
        </Link>
        */}

      </View>
    );
  }
}

// Using 'OpenURLButton' from https://reactnative.dev/docs/linking
