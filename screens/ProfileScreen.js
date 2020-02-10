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
  logOut,
  setUserData
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

        const {
            data: { homeBase = '',
                    username = 'Unnamed Plogger',
                    shareActivity = false,
                    emailUpdatesEnabled = false,
                  } = {},
            displayName,
        } = props.currentUser || { data: {}};

        this.state = {
            params: {
                displayName,
                homeBase,
                username,
                shareActivity,
                emailUpdatesEnabled,
            }
        };
    }

  handleShareActivityPrefChange = (shareActivity) => {
      this.props.updatePreferences({ shareActivity });
  }

    goToSignup = () => {
        this.props.navigation.navigate('Signup');
    }

    save = event => {
        setUserData({...this.state.params});
    }

  render() {
      const {params} = this.state;
      const currentUser = this.props.currentUser;

      const setParam = param => (text => this.setState(({params}) => ({params: { ...params, [param]: text }})));
      const toggleParam = param => (_ => {
          this.setState(({params}) => ({params: { ...params, [param]: !params[param] }}), _ => {
              this.save();
          });
      });

      const created = new Date(parseInt(currentUser.createdAt));

      let createdFormatted;

      try {
          createdFormatted = new Intl.DateTimeFormat('en-us', {month: 'long', year: 'numeric'}).format(created);
      } catch(_) {
          createdFormatted = created.toISOString();
      }

    return (
      <View style={$S.screenContainer}>
        <ScrollView style={$S.screenContainer} contentContainerStyle={[$S.scrollContentContainer, styles.contentContainer]}>

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
              <Text style={{ fontWeight: '500' }}>
                Personal Account
              </Text>
              <Text style={{ fontWeight: '500' }}>
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
                       value={params.displayName}
                       autoCompleteType="username"
                       onChangeText={setParam('displayName')}
                       onBlur={this.save}
            />
          </View>

          <View style={$S.inputGroup}>
            <Text style={$S.inputLabel}>Home Base</Text>
            <TextInput style={$S.textInput}
                       autoCapitalize="none"
                       value={params.homeBase}
                       onChangeText={setParam('homeBase')}
                       onBlur={this.save}
            />
          </View>

          <View style={$S.switchInputGroup}>
            <Text style={$S.inputLabel}>
              Share in Local Feed
            </Text>
            <Switch value={params.shareActivity}  style={{ transform: [{scale: 0.8}] }} onValueChange={toggleParam('shareActivity')} />
          </View>
          <View style={$S.switchInputGroup}>
            <Text style={$S.inputLabel}>
              Get email updates ({'< 1/month'})
            </Text>
            <Switch value={params.emailUpdatesEnabled} style={{ transform: [{scale: 0.8}] }} onValueChange={toggleParam('emailUpdatesEnabled')} />
          </View>

          <Button primary onPress={this.goToSignup} title={currentUser.isAnonymous ? 'Create Plogalong Account' : "Link Account" }/>
          <Button primary onPress={logOut} title={currentUser.isAnonymous ? 'Log in as Existing User' : 'Log Out'} />
        </ScrollView>
        <View style={{ height: 25 }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
      currentUser: state.users.get("current") && state.users.get('current').toJS(),
    preferences: state.preferences,
  }),
  (dispatch) => ({
    updatePreferences(preferences) {
      dispatch(setPreferences(preferences))
    },

  })
)(ProfileScreen);
