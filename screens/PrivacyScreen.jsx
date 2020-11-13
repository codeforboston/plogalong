import React from "react";
import {
  ScrollView,
  Text,
  View,
} from "react-native";

import { A, OpenURLButton } from '../components/Link';
import $S from '../styles';

const firebasePrivacyURL = "https://firebase.google.com/support/privacy";
const plogalongPrivacyURL = "https://app.termly.io/document/privacy-policy/34e2a625-a793-44ce-b92c-a5872d420597";
const mainMessage =
  "You must share your location with the app to log your plogs, but you can choose to keep your plogs private. Your plogging data is stored securely in ";
const privacyDetails =
  `Control sharing settings on your profile, or every time you plog
   Edit exact location of your plog before you submit by dragging the plogging map 
   Your email address is not shown to other users 
   We will not contact you without your permission`;


const DefaultBullet = <Text style={{ fontSize: 30, marginTop: -7 }}>{'\u2022'}</Text>;
const LI = ({children, bullet=DefaultBullet}) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 }}>
    {React.cloneElement(bullet, { style: [bullet.props.style, { flex: 0, paddingRight: 10 }] })}
    <Text style={[$S.body, { marginBottom: 0 }]}>{children}</Text>
  </View>
);

export default class PrivacyScreen extends React.Component {
  render() {
    return (
      <ScrollView style={$S.container}>
        <View style={$S.bodyContainer}>
          <Text style={$S.body} selectable={true}>{mainMessage}<A href={firebasePrivacyURL}>Google Firebase</A>.</Text>
          {privacyDetails.split('\n').map((text, i) => (
            <LI key={i}>{text.trim()}</LI>
          ))}
        </View>

        <OpenURLButton url={plogalongPrivacyURL}>View Privacy Policy</OpenURLButton>
      </ScrollView>
    );
  }
}
