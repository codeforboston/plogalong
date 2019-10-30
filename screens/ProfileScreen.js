import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { connect } from 'react-redux';


import {
  loginWithFacebook,
  logOut,
} from '../firebase/auth';
import Button from '../components/Button';
import { Switch } from 'react-native';
import { setPreferences, logout} from '../redux/actions';

class ProfileScreen extends React.Component {

  handleShareActivityPrefChange = (shareActivity) => {
    this.props.updatePreferences({ shareActivity })
  }

    goToSignup = () => {
        this.props.navigation.navigate('Signup');
    }

  render() {
    const currentUser = this.props.currentUser && this.props.currentUser.toJS();

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

          <View>
            <Text style={styles.welcomeText}>Hello, {currentUser.displayName||'Fellow Plogger'}!</Text>
            <Button primary onPress={this.goToSignup} title="Create Plogalong Account" />
          </View>

          <Button primary onPress={logOut} title="Login as different User" />
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
    padding: 20
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
  },
    welcomeText: {
        textAlign: 'center'
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
    },

  })
)(ProfileScreen);
