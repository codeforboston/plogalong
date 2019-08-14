import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Clipboard,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Colors from '../constants/Colors';
import { ShareDialog } from 'react-native-fbsdk';

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
    <View>
      <Modal
        visible={isInviteModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={toggleIsInviteModalVisible}
      >
        <View style={styles.modal}>
          <Button
            title="back"
            icon={<Ionicons name="md-close" size={32} color="white" />}
            onPress={toggleIsInviteModalVisible}
            style={styles.closeModal}
          />
          <View style={styles.inviteModalContainers}>
            <Text style={[styles.inviteContainer, { fontSize: 20 }]}>Invite</Text>
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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.activeColor,
  },
  closeModal: {
    position: 'absolute',
    left: 340,
    right: 0,
    top: 40,
    bottom: 0,
    borderWidth: 0,
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
