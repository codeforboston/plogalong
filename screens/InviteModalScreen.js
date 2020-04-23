import * as React from 'react';
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
import { ShareDialog } from 'react-native-fbsdk';
import $S from '../styles';

export default InviteModalScreen = ({isInviteModalVisible, toggleIsInviteModalVisible}) => {
  const PLOGALONG_LINK = "http://www.plogalong.com";
  const SHARE_LINK_CONTENT = {
    contentType: 'link',
    contentUrl: PLOGALONG_LINK,
    contentDescription: "Jus lil ol me, ploggin along",
  };
  writeToClipboard = async () => {
    await Clipboard.setString(PLOGALONG_LINK);
  }

  shareTo = () => {}

  shareLinkWithShareDialog = () => {
    ShareDialog.canShow(SHARE_LINK_CONTENT).then(canShow => {
      if (canShow) {
        return ShareDialog.show(SHARE_LINK_CONTENT);
      }
    }).then(result => {
      if (result.isCancelled) {
        alert('Share operation was cancelled');
      } else {
        alert('Share was successful with postId: '
          + result.postId);
      }
    }, error => {
        alert('Share failed with error: ' + error.message);
    });
  }

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
          <Text style={$S.h2}>Invite</Text>
          <TextInput
            value={PLOGALONG_LINK}
            selectTextOnFocus
            style={[styles.textInput, styles.inviteContainer]}
          />
          <Button title="Copy Link" onPress={writeToClipboard} style={styles.copyButton} />
        </View>
        <View style={styles.inviteModalContainers}>
          <Button title="Share on Facebook" onPress={shareLinkWithShareDialog} style={styles.shareButtons} />
        </View>
        <View style={styles.inviteModalContainers}>
          <Button title="Share on Twitter" onPress={shareTo} style={styles.shareButtons} />
        </View>
        <View style={styles.inviteModalContainers}>
          <Button title="Share on Instagram" onPress={shareTo} style={styles.shareButtons} />
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
