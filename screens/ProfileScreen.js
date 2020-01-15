import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import {
  loginWithFacebook,
  logOut,
} from '../firebase/auth';
import Banner from '../components/Banner';
import Button from '../components/Button';
import { Switch } from 'react-native';
import { setPreferences, logout} from '../redux/actions';

import Colors from '../constants/Colors';
import $S from '../styles';

class ProfileScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            params: {
                homeBase: 'Boston, MA',
                username: 'Beach Bum'
            }
        };
    }

  handleShareActivityPrefChange = (shareActivity) => {
    this.props.updatePreferences({ shareActivity })
  }

    goToSignup = () => {
        this.props.navigation.navigate('Signup');
    }

  render() {
      const {params} = this.state;
    const currentUser = this.props.currentUser && this.props.currentUser.toJS();

      const setParam = param => (text => this.setState(({params}) => ({params: { ...params, [param]: text }})));
      const created = new Date(parseInt(currentUser.createdAt));

      const createdFormatted = new Intl.DateTimeFormat('en-us', {month: 'long', year: 'numeric'}).format(created);

    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

          <Banner>
            Plogging since {createdFormatted}
          </Banner>
          {/* // alerts */}

          <View style={styles.personalInfoContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/profile.png')
                  : require('../assets/images/profile.png')
              }
              style={styles.profileImage}
            />
            <View style={styles.personalInfo}>
              <Text style={styles.badgeSummary}>
                0 badges
              </Text>
              <Text style={{ fontWeight: 500 }}>
                Personal Account
              </Text>
              <Text style={{ fontWeight: 500 }}>
                { currentUser.email }
              </Text>
            </View>
          </View>

          <View>
            <Text style={styles.welcomeText}>
              Hello, {currentUser.displayName||'Fellow Plogger'}!
            </Text>
          </View>

          <View style={$S.inputGroup}>
            <Text style={$S.inputLabel}>Username (visible to others)</Text>
            <TextInput style={$S.textInput}
                       autoCapitalize="none"
                       value={params.username}
                       autoCompleteType="username"
                       onChangeText={setParam('username')}
            />
          </View>

          <View style={$S.inputGroup}>
            <Text style={$S.inputLabel}>Home Base</Text>
            <TextInput style={$S.textInput}
                       autoCapitalize="none"
                       value={params.homeBase}
                       onChangeText={setParam('homeBase')}
            />
          </View>

          <View style={$S.switchInputGroup}>
            <Text style={$S.inputLabel}>
              Share in Local Feed
            </Text>
            <Switch value={params.shareActivity} style={{ transform: [{scale: 0.8}] }}/>
          </View>
          <View style={$S.switchInputGroup}>
            <Text style={$S.inputLabel}>
              Get email updates ({'< 1/month'})
            </Text>
            <Switch value={params.emailUpdatesEnabled} style={{ transform: [{scale: 0.8}] }}/>
          </View>

          <Button primary onPress={this.goToSignup} title={currentUser.isAnonymous ? 'Create Plogalong Account' : "Link Account" }/>
          <Button primary onPress={logOut} title={currentUser.isAnonymous ? 'Log in as Existing User' : 'Log Out'} />
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
  personalInfoContainer: {
      flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
    badgeSummary: {
        borderColor: Colors.borderColor,
        borderRadius: 5,
        borderWidth: 1,
        backgroundColor: '#E5E9F2',
        marginBottom: 10,
        padding: 10,
    },
    personalInfo: {
        flexDirection: 'column',
        flexGrow: 1,
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
