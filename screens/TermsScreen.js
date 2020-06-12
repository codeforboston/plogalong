import React, { useCallback } from "react";
import {
  Button,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import $S from '../styles';

const websiteURL = "https://www.plogalong.com/";
const mainMessage =
  "TODO";
const createdBy =
  "";

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
        Visit plogalong.com
      </Text>
    </View>
  );
};

export default class TermsScreen extends React.Component {
  render() {
    return (
      <View style={$S.container}>
        <View style={$S.bodyContainer}>
          <Text style={$S.body}>{mainMessage}</Text>
          <Text style={$S.body}>{createdBy}</Text>
        </View>
        
        <OpenURLButton url={websiteURL}/>
      </View>
    );
  }
}

