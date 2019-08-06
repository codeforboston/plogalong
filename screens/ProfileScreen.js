import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import * as WebBrowser from 'expo-web-browser';


import {
  loginWithFacebook,
  logOut,
} from '../firebase/auth';
import Button from '../components/Button';
import { Switch } from 'react-native';
import { setPreferences} from '../redux/actions';

class ProfileScreen extends React.Component {

  handleShareActivityPrefChange = (shareActivity) => {
    this.props.updatePreferences({ shareActivity })
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

          {/* privacy */}
          <View style={styles.preferencesContainer}>
            <Text>Share the activity in local feed</Text>
            <Switch value={this.props.preferences.get("shareActivity")} 
              onValueChange={this.handleShareActivityPrefChange}></Switch>
          </View>

          {/* // alerts */}

          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/profile.png')
                  : require('../assets/images/profile.png')
              }
              style={styles.welcomeImage}
            />
          </View>

          {
            this.props.currentUser ?
              (
                <View>
                  <Text>Hello, {this.props.currentUser.get("displayName")}!</Text>
                  <Button primary onPress={logOut} title="Log out" />
                </View>
              ) :
              (
                <Button
                  onPress={loginWithFacebook}
                  title="Log in"
                />
              )
          }

        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  }
});

export default connect(
  (state) => ({
    currentUser: state.users.get("current"),
    preferences: state.preferences,
  }),
  (dispatch) => ({
    updatePreferences(preferences) {
      dispatch(setPreferences(preferences))
    }
  })
)(ProfileScreen);
