import React from "react";
import {
  ScrollView,
  Text,
  View,
} from "react-native";

import { A, OpenURLButton } from '../components/Link';
import $S from '../styles';

const websiteURL = "https://www.plogalong.com/";
const mainMessage =
  "Plogalong helps you track your plogs, connect with nearby ploggers, earn badges, and access local discounts.";
const createdBy =
  "Plogalong is currently in the development stage at Code for Boston Hack Nights and Hackathon.";


export default class AboutScreen extends React.Component {
  render() {
    return (
      <ScrollView style={$S.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={$S.bodyContainer}>
          <Text style={$S.body}>
            When you plog, you pick up trash as you go about your daily life... jogging, hiking, or simply walking down the street. Ploggers help keep our neighborhoods, parks, and oceans clean.
          </Text>
          <Text style={$S.body}>
            Plogalong helps you track your plogging history and see who else is plogging nearby. Stay motivated by earning badges and plogging minutes, or sharing your plogs on social media.
          </Text>
          <Text style={$S.body}>
            Plogalong was designed by <A href="http://slipperstudios.com">Slipper Studios</A>, and was built as an open source civic project at <A href="https://www.codeforboston.org">Code for Boston</A>.
          </Text>

        </View>

        <OpenURLButton url={websiteURL}>Visit plogalong.com</OpenURLButton>
        <OpenURLButton url="https://www.facebook.com/Plogalong-100585405000063/">Like us on Facebook</OpenURLButton>
      </ScrollView>
    );
  }
}
