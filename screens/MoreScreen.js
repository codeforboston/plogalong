import * as React from 'react';
import { useEffect } from 'react';
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
import TermsScreen from './TermsScreen';
import ContactScreen from './ContactScreen';
import PrivacyScreen from './PrivacyScreen';
import PloggingSuppliesScreen from './PloggingSuppliesScreen';
import AchievementScreen from './AchievementScreen';


import arrow from '../assets/svg/headerBackImage/arrow.svg';
import $S from '../styles';


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
    this.props.navigation.navigate('Invite');
  }

  goToPlogScreen = () => {
    this.props.navigation.navigate('Plog');
  }

  pages = [
    {label: 'About Plogalong', route: 'About'},
    {label: 'Achievements', route: 'Achievements'},
    {label: 'Contact Us', route: 'Contact Us'},
    {label: 'Plogging Supplies', route: 'Plogging Supplies'},
    {label: 'Privacy', route: 'Privacy'},
    {label: 'Terms', route: 'Terms'},
  ];

  render() {
    return (
      <View style={[styles.container]}>
        <Banner style={styles.banner}>
          Life is hard. Plogging is easy.
        </Banner>
        <NavMenu routes={this.pages}/>
        <View style={$S.footerButtons}>
          <Button title="Plog"
                  large primary
                  onPress={this.goToPlogScreen}
          />
        </View>
      </View>
    );
  }
}

const Stack = createStackNavigator();

export default ({navigation, route}) => {
    return (
        <Stack.Navigator screenOptions={{
            headerBackTitle: ' ',
            headerBackImage: arrow,
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
          <Stack.Screen name="Achievements" component={ AchievementScreen }/>
          <Stack.Screen name="Contact Us" component={ ContactScreen }/>
          <Stack.Screen name="Privacy" component={ PrivacyScreen }/>
          <Stack.Screen name="Terms" component={ TermsScreen }/>
          <Stack.Screen name="Plogging Supplies" component={ PloggingSuppliesScreen }/>
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  banner: {
    marginBottom: 20,
  },
});
