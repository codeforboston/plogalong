import React, { useCallback } from "react";
import { StyleSheet, Text, View, Button, Linking } from "react-native";
import $S from '../styles';

const websiteURL = "https://www.plogalong.com/";
const mainMessage =
  "Plogalong helps you track your plogs, connect with nearby ploggers, earn badges, and access local discounts.";
const createdBy =
  "Plogalong is currently in the development stage at Code for Boston Hack Nights and Hackathon.";

const slipperStudiosURL = "http://www.slipperstudios.com/";
const codeForBostonURL = "https://www.codeforboston.org/";
const plogalongFacebookURL = "https://www.facebook.com/Plogalong-100585405000063/";

const OpenURLButton = ({ url, children }) => {
  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, [url]);

  return <Button title={children} onPress={handlePress} />;
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
            Plogalong was designed by <Text 
              style={$S.link} 
              onPress={() => Linking.openURL(slipperStudiosURL)}>
                Slipper Studios
              </Text>, and was built as an open source civic project at <Text 
              style={$S.link} 
              onPress={() => Linking.openURL(codeForBostonURL)}>
                Code for Boston
              </Text>.
          </Text>
          <Text style={$S.body}>
            Visit <Text 
              style={$S.link} 
              onPress={() => Linking.openURL(websiteURL)}>
                plogalong.com
              </Text> | Like Us on <Text 
              style={$S.link} 
              onPress={() => Linking.openURL(plogalongFacebookURL)}>
                Facebook
              </Text>
          </Text>
        </View>
        {/* Lines 33-35 can be changed into a custom component*/}
        
        <OpenURLButton url={websiteURL}>Visit our Website</OpenURLButton>
      </View>
    );
  }
}

// Using 'OpenURLButton' from https://reactnative.dev/docs/linking
