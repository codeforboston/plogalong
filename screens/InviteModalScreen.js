import * as React from 'react';
import { useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Modal,
  Clipboard,
  TextInput,
} from 'react-native';
import Button from '../components/Button';
import Colors from '../constants/Colors';
import DismissButton from '../components/DismissButton';
import OpenURLButton from '../components/OpenURLButton';
import $S from '../styles';

export default InviteModalScreen = ({isInviteModalVisible, toggleIsInviteModalVisible}) => {
  const PLOGALONG_LINK = "https://www.plogalong.com";

  const writeToClipboard = useCallback(async () => {
    await Clipboard.setString(PLOGALONG_LINK);
  }, [PLOGALONG_LINK]);

  return (
    <Modal
      visible={isInviteModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={toggleIsInviteModalVisible}
    >
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalControls}>
          <DismissButton
            color="white"
            title="back"
            onPress={toggleIsInviteModalVisible}
          />
        </View>
        <View style={styles.inviteModalContainers}>
          <Text style={[$S.h1, { textAlign: 'center' }]}>Invite</Text>
          <TextInput
            value={PLOGALONG_LINK}
            selectTextOnFocus
            style={[styles.textInput, styles.inviteContainer]}
          />
          <Button title="Copy Link" onPress={writeToClipboard} style={styles.copyButton} />
        </View>
        <View style={styles.inviteModalContainers}>
          <Text style={{ textAlign: 'center', fontSize: '18' }}>Share on your favorite app</Text>
          <OpenURLButton url="https://www.facebook.com/">Connect to Facebook</OpenURLButton>
          <OpenURLButton url="https://twitter.com/">Connect to Twitter</OpenURLButton>
          <OpenURLButton url="https://www.instagram.com/">Connect to Instagram</OpenURLButton>
        </View>
        <View style={{ flex: 1 }}/>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.activeColor,
  },
  modalControls: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 20,
  },
  shareButtons: {
    borderWidth: 0,
    fontSize: 18,
  },
  inviteModalContainers: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: '75%',
    margin: 10,
    padding: 10,
  },
  copyButton: {
    backgroundColor: Colors.secondaryColor,
    color: Colors.noticeText,
    padding: 10,
  },
  textInput: {
    borderStyle: 'solid',
    borderColor: Colors.textGray,
    borderWidth: 1,
    padding: 15,
    color: Colors.textGray,
  },
  inviteContainer: {
    margin: 5,
  },
});
