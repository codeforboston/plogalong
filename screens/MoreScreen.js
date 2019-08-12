import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
} from 'react-native';

import { createStackNavigator } from 'react-navigation';

import NavMenu from '../components/NavMenu';
import AboutScreen from './AboutScreen';
import FAQScreen from './FAQScreen';
import ActivePloggerMap from './ActivePloggerMap';
import SuppliesScreen from './SuppliesScreen';
import CouchPloggingScreen from './CouchPloggingScreen';
import SocialMediaScreen from './SocialMediaScreen';

const InviteModal = ({isInviteModalVisible, toggleIsInviteModalVisible}) => (
  <View>
    <Modal
      visible={isInviteModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={toggleIsInviteModalVisible}
    >
      <View>
        <Text style={{ fontSize: 20 }} >Invite modal</Text>
      </View>
    </Modal>
  </View>
);

export class MoreScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = { isInviteModalVisible: false };
    }

    toggleIsInviteModalVisible = () => {
      this.setState(prevState => ({isInviteModalVisible: !prevState.isInviteModalVisible}));
      console.log("here");
    }

    static navigationOptions = {
        header: null,
        headerBackTitle: 'More'
    };

  render() {
    const pages = [
      {label: 'About Plogalong', route: 'About'},
      {label: 'FAQ', route: 'FAQ'},
      {label: 'Active Plogger Map', route: 'ActivePloggerMap'},
      {label: 'Plogging Supplies', route: 'Supplies'},
      {label: 'Couch Plogging', route: 'CouchPlogging'},
      {label: 'Plogging on Social Media', route: 'SocialMedia'},
      {label: 'Invite', route: 'Modal', params: { content: <InviteModal />}}
    ];

    return (
      <View style={styles.container}>
        <InviteModal
          isInviteModalVisible={this.state.isInviteModalVisible}
          toggleIsInviteModalVisible={this.toggleIsInviteModalVisible}
        />
        <NavMenu routes={pages}/>
      </View>
    );
  }
}

export default createStackNavigator({
    Menu: MoreScreen,
    About: AboutScreen,
    FAQ: FAQScreen,
    ActivePloggerMap,
    Supplies: SuppliesScreen,
    CouchPlogging: CouchPloggingScreen,
    SocialMedia: SocialMediaScreen
}, {
    headerStyle: { height: 100 }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: 'gray'
    },
});
