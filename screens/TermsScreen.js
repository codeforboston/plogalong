import React, { useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
} from "react-native";

import { A, OpenURLButton } from '../components/Link';

import $S from '../styles';

const disclaimerURL = "https://app.termly.io/document/disclaimer/e6911739-21db-4678-84a0-68ffc4b597b1";
const mainMessage =
  "Slipper Studios, LLC, with partnership with Code for Boston, built the Plogalong app as an Open Source app. This Service is provided by Slipper Studios, LLC at no cost, and is intended for use as is.";
const termsURL = "https://app.termly.io/document/terms-of-use-for-ios-app/a3df3866-e2e8-4a51-8ac1-a4b41efe140b"
const guidelines =
  "This app is intended to be used outdoors. You are responsible for your safety while using the app. Slipper Studios, LLC, does not accept liability for any risks, hazards, injuries, or other harm that may come to you while plogging.";

export default class TermsScreen extends React.Component {
  render() {
    return (
      <ScrollView style={$S.container}>
        <View style={$S.bodyContainer}>
          <Text style={$S.body}>{mainMessage}</Text>
        </View>
        <OpenURLButton url={termsURL}>View Terms &amp; Conditions</OpenURLButton>
        <View style={$S.bodyContainer}>
          <Text style={$S.h1}>Safe Plogging Guidelines</Text>
          <Text style={$S.body}>{guidelines}</Text>
          <View style={{ alignItems: 'flex-start', marginBottom: 15, }}>
            <Text style={{fontSize: 18, marginBottom: 15}}>{`\u2022`}    Plog at your own risk</Text>
            <Text style={{fontSize: 18, marginBottom: 15}}>{`\u2022`}    Use caution when plogging, or encouraging others to plog</Text>
            <Text style={{fontSize: 18, marginBottom: 15}}>{`\u2022`}    Use protective equipment, including <A href="https://amzn.to/2WrVbEk">masks</A>, <A href="https://amzn.to/35Sfk9D">gloves</A>, and <A href="https://amzn.to/3bvmW2S">trash grabbers</A>.</Text>
            <Text style={{fontSize: 18, marginBottom: 15}}>{`\u2022`}    Report sharp or dangerous objects to your town or city</Text>
            <Text style={{fontSize: 18,}}>{`\u2022`}    Supervise children while plogging</Text>
          </View>
        </View>
        <View style={{marginBottom: 50}}>
          <OpenURLButton url={disclaimerURL}>View Disclaimer</OpenURLButton>
        </View>
      </ScrollView>
    );
  }
}

