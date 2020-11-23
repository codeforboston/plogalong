import * as React from 'react';
import { useEffect } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';

import Colors from '../constants/Colors';

import Banner from '../components/Banner';
import Button from '../components/Button';
import Header from '../components/Header';
import NavMenu from '../components/NavMenu';

import AboutScreen from './AboutScreen';
import TermsScreen from './TermsScreen';
import ContactScreen from './ContactScreen';
import PrivacyScreen from './PrivacyScreen';
import PloggingSuppliesScreen from './PloggingSuppliesScreen';
import AchievementScreen from './AchievementScreen';


import Arrow from '../assets/svg/headerBackImage/arrow.svg';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';


export class MoreScreen extends React.Component {
  state = {
    isInviteModalVisible: false
  };

  toggleIsInviteModalVisible = () => {
    this.props.navigation.navigate('Invite');
  }

  goToPlogScreen = () => {
    this.props.navigation.navigate('Plog');
  }

  pages = [
    {label: 'About Plogalong', route: 'About'},
    {label: 'Achievements', route: 'Achievements'},
    {label: 'Contact Us', route: 'Contact Us'},
    {route: 'Plogging Supplies'},
    {label: 'Privacy & Security', route: 'Privacy & Security'},
    {label: 'Terms & Conditions', route: 'Terms & Conditions'},
  ];

  render() {
    return (
      <View style={[styles.container]}>
        <Banner style={styles.banner}>
          Life is hard. Plogging is easy.
        </Banner>
        <NavMenu routes={this.pages}/>
          <Button title="Plog"
                  large primary
                  onPress={this.goToPlogScreen}
          />
      </View>
    );
  }
}

const Stack = createStackNavigator();

export default ({route}) => {
    return (
        <Stack.Navigator screenOptions={{
            headerBackTitle: ' ',
            headerBackImage: () => <Arrow fill="purple"/>,
            title: getFocusedRouteNameFromRoute(route),
            headerTitle: (props) => (
                <Header text={props.children} />
            ),
            headerTitleAlign: 'center',
            headerStyle: {
                backgroundColor: '#fff',
                borderBottomColor: Colors.activeColor,
                borderBottomWidth: 4,
            }
        }}
                         initialRouteName="More">
          <Stack.Screen name="More" component={ MoreScreen }/>
          <Stack.Screen name="About" component={ AboutScreen }/>
          <Stack.Screen name="Achievements" component={ AchievementScreen }/>
          <Stack.Screen name="Contact Us" component={ ContactScreen }/>
          <Stack.Screen name="Privacy & Security" component={ PrivacyScreen }/>
          <Stack.Screen name="Terms & Conditions" component={ TermsScreen }/>
          <Stack.Screen name="Plogging Supplies" component={ PloggingSuppliesScreen }/>
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 35,
  },
  banner: {
    marginBottom: 20,
  },
});
