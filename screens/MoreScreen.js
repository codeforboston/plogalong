import * as React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';

import Header from '../components/Header';
import NavMenu from '../components/NavMenu';

import AboutScreen from './AboutScreen';
import FAQScreen from './FAQScreen';
import ActivePloggerMap from './ActivePloggerMap';
import SuppliesScreen from './SuppliesScreen';
import CouchPloggingScreen from './CouchPloggingScreen';
import SocialMediaScreen from './SocialMediaScreen';
import InviteModalScreen from './InviteModalScreen';


const decamel = s => s.replace(/([^A-Z])([A-Z])/gu, '$1 $2');

const routeName = ({state, params, name}, defaultName=name) => {
    return state ?
        routeName(state.routes[state.index]) :
        (params && params.title || defaultName);
};

export class MoreScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isInviteModalVisible: false };
  }

  toggleIsInviteModalVisible = () => {
    this.setState(prevState => ({isInviteModalVisible: !prevState.isInviteModalVisible}));
  }

  pages = [
    {label: 'About Plogalong', route: 'About'},
    {label: 'FAQ', route: 'FAQ'},
    {label: 'Active Plogger Map', route: 'ActivePloggerMap'},
    {label: 'Plogging Supplies', route: 'Supplies'},
    {label: 'Couch Plogging', route: 'CouchPlogging'},
    {label: 'Plogging on Social Media', route: 'SocialMedia'},
    {label: 'Invite', route: false, handlePress: this.toggleIsInviteModalVisible},
  ];

  render() {
    return (
      <View style={styles.container}>
        <InviteModalScreen toggleIsInviteModalVisible={this.toggleIsInviteModalVisible} isInviteModalVisible={this.state.isInviteModalVisible} />
        <NavMenu routes={this.pages}/>
      </View>
    );
  }
}

const Stack = createStackNavigator();

export default ({navigation, route}) => {
    return (
        <Stack.Navigator screenOptions={{
            headerBackTitle: 'More',
            title: decamel(routeName(route)),
            headerTitle: (props) => (
                <Header text={props.children} />
            ),
            headerTitleAlign: 'center',
            headerStyle: {
                backgroundColor: '#fff',
                borderBottomColor: 'purple',
                borderBottomWidth: 4,
            }
        }}>
          <Stack.Screen name="More" component={ MoreScreen }/>
          <Stack.Screen name="About" component={ AboutScreen }/>
          <Stack.Screen name="FAQ" component={ FAQScreen }/>
          <Stack.Screen name="ActivePloggerMap" component={ ActivePloggerMap }/>
          <Stack.Screen name="Supplies" component={ SuppliesScreen }/>
          <Stack.Screen name="CouchPlogging" component={ CouchPloggingScreen }/>
          <Stack.Screen name="SocialMedia" component={ SocialMediaScreen }/>
          <Stack.Screen name="InviteModal" component={ InviteModalScreen}/>
        </Stack.Navigator>
    );
};

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
