import React, { useCallback } from "react";
import { StyleSheet, Text, View, Button, Linking, FlatList } from "react-native";
import $S from '../styles';

const firebasePrivacyURL = "https://firebase.google.com/support/privacy";
const plogalongPrivacyURL = ""; // TODO: Iubenda
const mainMessage =
  "You must share your location with the app to log your plogs, but you can choose to keep your plogs private. Your plogging data is stored securely in ";
const privacyDetails =
  `Control sharing settings on your profile, or every time you plog
   Edit exact location of your plog before you submit by dragging the plogging map 
   Your email address is not shown to other users 
   We will not contact you without your permission`;



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

const DefaultBullet = <Text style={{ fontSize: 30, marginTop: -7 }}>{'\u2022'}</Text>;
const LI = ({children, bullet=DefaultBullet}) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 }}>
    {React.cloneElement(bullet, { style: [bullet.props.style, { flex: 0, paddingRight: 10 }] })}
    <Text style={[$S.body, { marginBottom: 0 }]}>{children}</Text>
  </View>
)

export default class PrivacyScreen extends React.Component {
  static navigationOptions = {
    title: "About Plogalong",
  };

  render() {
    return (
      <View style={$S.container}>
        <View style={$S.bodyContainer}>
          <Text style={$S.body} selectable={true}>{mainMessage}<Text style={$S.link} onPress={() => Linking.openURL(firebasePrivacyURL)}>Google Firebase</Text></Text>
          {privacyDetails.split('\n').map((text, i) => (
            <LI key={i}>{text.trim()}</LI>
          ))}
        </View>

        <OpenURLButton url={plogalongPrivacyURL}>Visit our Website</OpenURLButton>
      </View>
    );
  }
}
