import React, { useCallback } from "react";
import {
  Button,
  Linking,
  ScrollView,
  StyleSheet,
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

export default () =>(
  <ScrollView style={$S.container}>
    <Text style={$S.h1}>About Plogalong</Text>
    <View style={$S.bodyContainer}>
      <Text style={$S.body}>{mainMessage}</Text>
      <Text style={$S.body}>{createdBy}</Text>
    </View>
    <OpenURLButton url={websiteURL}>Visit our Website</OpenURLButton>
  </ScrollView>
);

// Using 'OpenURLButton' from https://reactnative.dev/docs/linking
