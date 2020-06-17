import React, { useCallback } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { A } from '../components/Link';
import $S from '../styles';

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
      <Text style={$S.linkButtonText} onPress={handlePress}>
      {children}
      </Text>
    </View>
  );
};

export default class AboutScreen extends React.Component {
  render() {
    return (
      <View style={$S.container}>
        <View style={$S.bodyContainer}>
          <Text style={$S.h1}>About Plogalong</Text>
          <Text style={$S.body}>
            When you plog, you pick up trash as you go about your daily life... jogging, hiking, or simply walking down the street. Ploggers help keep our neighborhoods, parks, and oceans clean.
          </Text>
          <Text style={$S.body}>
            Plogalong helps you track your plogging history and see who else is plogging nearby. Stay motivated by earning badges and plogging minutes, or sharing your plogs on social media.
          </Text>
          <Text style={$S.body}>
            Plogalong was designed by <A href="https://slipperstudios.com">Slipper Studios</A>, and was built as an open source civic project at <A href="https://www.codeforboston.org">Code for Boston</A>.
          </Text>

        </View>

        <OpenURLButton url="https://www.plogalong.com/"/>
        <OpenURLButton url="https://www.facebook.com/Plogalong-100585405000063/">Like Us On Facebook</OpenURLButton>
      </View>
    );
  }
}
