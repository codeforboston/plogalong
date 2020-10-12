import React, { useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
} from "react-native";

import { OpenURLButton } from '../components/Link';

import $S from '../styles';

const websiteURL = "https://www.plogalong.com/";
const mainMessage =
  "TODO";
const createdBy =
  "";

export default class TermsScreen extends React.Component {
  render() {
    return (
      <ScrollView style={$S.container}>
        <View style={$S.bodyContainer}>
          <Text style={$S.body}>{mainMessage}</Text>
          <Text style={$S.body}>{createdBy}</Text>
        </View>

        <OpenURLButton url={websiteURL}>Visit plogalong.com</OpenURLButton>
      </ScrollView>
    );
  }
}

