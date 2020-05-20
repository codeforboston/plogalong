import React, { useCallback } from "react";
import { StyleSheet, Text, View, Button, Linking } from "react-native";
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

  return <Button title={children} onPress={handlePress} />;
};

export default class TermsScreen extends React.Component {
  static navigationOptions = {
    title: "Terms",
  };

  render() {
    return (
      <View style={$S.container}>
        <View style={$S.bodyContainer}>
          <Text style={$S.body}>{mainMessage}</Text>
          <Text style={$S.body}>{createdBy}</Text>
        </View>
        {/* Lines 33-35 can be changed into a custom component*/}
        
        <OpenURLButton url={websiteURL}>Visit our Website</OpenURLButton>
      </View>
    );
  }
}

// Using 'OpenURLButton' from https://reactnative.dev/docs/linking
