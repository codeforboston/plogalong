import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';

import Banner from '../components/Banner';
import Button from '../components/Button';
import Header from '../components/Header';
import NavMenu from '../components/NavMenu';

import AboutScreen from './AboutScreen';
import FAQScreen from './FAQScreen';
import ContactScreen from './ContactScreen';
import InviteModalScreen from './InviteModalScreen';
import PrivacyAndTerms from './PrivacyAndTerms';


const decamel = s => s.replace(/([^A-Z])([A-Z])/gu, '$1 $2');

const routeName = ({state, params, name}, defaultName=name) => {
    return state ?
        routeName(state.routes[state.index]) :
        (params && params.title || defaultName);
};

export class MoreScreen extends React.Component {
  state = {
    isInviteModalVisible: false
  };

  toggleIsInviteModalVisible = () => {
    this.setState(prevState => ({isInviteModalVisible: !prevState.isInviteModalVisible}));
  }

  goToPlogScreen = () => {
    this.props.navigation.navigate('Plog');
  }

  pages = [
    {label: 'About Plogalong', route: 'About'},
    {label: 'FAQ', route: 'FAQ'},
    {label: 'Contact Us', route: 'Contact Us'},
    {label: 'Privacy and Terms', route: 'Privacy'},
    {label: 'Invite', route: false, handlePress: this.toggleIsInviteModalVisible},
  ];

  render() {
    return (
      <View style={[styles.container]}>
        <Banner style={styles.banner}>
          Life is hard. Plogging is easy.
        </Banner>
        <NavMenu routes={this.pages}/>
        <View style={styles.buttons}>
          <Button title="Invite"
                  large
                  onPress={this.toggleIsInviteModalVisible}
          />
          <Button title="Plog"
                  large primary
                  onPress={this.goToPlogScreen}
          />
        </View>
        <InviteModalScreen toggleIsInviteModalVisible={this.toggleIsInviteModalVisible}
                           isInviteModalVisible={this.state.isInviteModalVisible} />
      </View>
    );
  }
}

const Stack = createStackNavigator();

export default ({navigation, route}) => {
  useEffect(() => {
    if (route.params && route.params.subscreen)
      navigation.navigate(route.params.subscreen);

  }, [route.params]);

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
          <Stack.Screen name="Contact Us" component={ ContactScreen }/>
          <Stack.Screen name="Privacy" component={ PrivacyAndTerms }/>
          <Stack.Screen name="InviteModal" component={ InviteModalScreen }/>
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  divider: {
      borderBottomWidth: 1,
      borderBottomColor: 'gray'
  },
  banner: {
    marginBottom: 20,
  },
  buttons: {
    margin: 30,
    marginBottom: 50,
  }
});
