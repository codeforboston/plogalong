import * as React from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';

import {
  logOut,
  setUserData
} from '../firebase/auth';
import Banner from '../components/Banner';
import Button from '../components/Button';
import PhotoButton from '../components/PhotoButton';
import TextInputWithIcon from '../components/TextInputWithIcon';
import { setPreferences, logout} from '../redux/actions';
import { pluralize } from '../util';

import Colors from '../constants/Colors';
import $S from '../styles';
import ProfilePlaceholder from '../components/ProfilePlaceholder';


const stateFromProps =
      ({currentUser: { data: { homeBase = '',
                               displayName,
                               shareActivity = false,
                               emailUpdatesEnabled = false,
                               privateProfile = false,
                             } = {}
                     }} = {}) => ({
                         params: {
                             displayName,
                             homeBase,
                             shareActivity,
                             emailUpdatesEnabled,
                             privateProfile,
                         }
                     });

class ProfileScreen extends React.Component {
    state = stateFromProps(this.props)

    componentDidUpdate(prevProps, prevState) {
        const {currentUser: {data: {updated}}} = this.props;
        if (prevProps.currentUser && prevProps.currentUser.data && prevProps.currentUser.data.updated !== updated) {
            this.setState(stateFromProps(this.props));
        }
    }

  handleShareActivityPrefChange = (shareActivity) => {
      this.props.updatePreferences({ shareActivity });
  }

    goToSignup = () => {
        this.props.navigation.navigate('Signup');
    }

    goToLogin = () => {
      this.props.navigation.navigate('Login');
    }

  goToChangePassword = () => {
    this.props.navigation.navigate('ChangePassword');
  }

    save = event => {
        this.props.setUserData({...this.state.params});
    }

    setProfilePhoto = photo => {
        this.props.setUserData({ profilePicture: photo });
    }

  setHomeBaseFromLocationInfo = () => {
    const { locationInfo } = this.props;

    if (locationInfo)
      this.props.setUserData({ homeBase: `${locationInfo.city}, ${locationInfo.region}` });
  }

  render() {
      const setParam = param => (text => this.setState(({params}) => ({params: { ...params, [param]: text }})));
      const toggleParam = param => (_ => {
          this.setState(({params}) => ({params: { ...params, [param]: !params[param] }}), _ => {
              this.save();
          });
      });

    const {currentUser} = this.props;
    const {achievements = {}, displayName, profilePicture} = currentUser.data || {};
    const created = new Date(parseInt(currentUser.createdAt));
    const {params} = this.state;

    const hasPassword = !!currentUser.providerData.find(pd => pd.providerId === 'password');

    const completedAchievements = Object.values(achievements).filter(ach => ach.completed).length;

    return (
        <ScrollView style={$S.screenContainer} contentContainerStyle={[$S.scrollContentContainer, styles.contentContainer]}>
          <Banner>
            Plogging since {moment(created).format('MMMM D, YYYY')}
          </Banner>

          {!currentUser.isAnonymous &&
           <>
             <View style={styles.personalInfoContainer}>
               <PhotoButton
                 photo={profilePicture ? {uri: profilePicture} : null}
                 defaultIcon={ProfilePlaceholder}
                 style={styles.profileImageButton}
                 imageStyle={styles.profileImage}
                 onPictureSelected={this.setProfilePhoto}
                 onCleared={() => { this.setProfilePhoto(null); }}
               />
                 <Text style={{ fontWeight: '500' }}>
                   Personal Account
                 </Text>
                 <Text style={{ fontWeight: '500' }}>
                   { currentUser.email }
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
                          maxLength={40}
               />
             </View>

             <View style={$S.inputGroup}>
               <Text style={$S.inputLabel}>Home Base</Text>
               <TextInputWithIcon autoCapitalize="sentences"
                                  value={params.homeBase}
                                  onChangeText={setParam('homeBase')}
                                  onBlur={this.save}
                                  onPress={this.setHomeBaseFromLocationInfo}
                                  iconName="ios-navigate"
                                  maxLength={40}
               />
             </View>

             <View style={$S.switchInputGroup}>
               <Text style={$S.inputLabel}>
                 Share in Local Feed
               </Text>
               <Switch value={params.shareActivity}  style={$S.switch} onValueChange={toggleParam('shareActivity')} />
             </View>
             <View style={$S.switchInputGroup}>
               <Text style={$S.inputLabel}>
                 Public Achievements
               </Text>
               <Switch value={!params.privateProfile} style={$S.switch} onValueChange={toggleParam('privateProfile')} />
             </View>
             <View style={$S.switchInputGroup}>
               <Text style={$S.inputLabel}>
                 Get email updates ({'< 1/month'})
               </Text>
               <Switch value={params.emailUpdatesEnabled} style={$S.switch} onValueChange={toggleParam('emailUpdatesEnabled')} />
             </View>
           </>}

          <View style={[styles.buttonContainer, currentUser.isAnonymous && styles.anonymousButtonContainer]}>
            <Button primary onPress={this.goToSignup} title={currentUser.isAnonymous ? 'Create Plogalong Account' : "Link Account" }/>
            <Button primary onPress={logOut} title={currentUser.isAnonymous ? 'Log in as Existing User' : 'Log Out'} />
            {hasPassword && <Button primary onPress={this.goToChangePassword} title="Change Password" />}
          </View>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
      padding: 20,
  },
  personalInfoContainer: {
      flexDirection: 'column',
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  profileImageButton: {
      width: 300,
      height: 300,
      marginTop: 3,      
      borderWidth: 0,
  },
    profileImage: {        
        resizeMode: 'contain',

    },
    personalInfo: {
        flexDirection: 'column',
        flexGrow: 1,
    },
    anonymousButtonContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    buttonContainer: {
        flexDirection: 'column',
    }
});

export default connect(
  ({users, preferences}) => ({
    currentUser: users.current,
    locationInfo: users.locationInfo,
    preferences,
  }),
  (dispatch) => ({
    updatePreferences(preferences) {
      dispatch(setPreferences(preferences))
    },
    setUserData,
  })
)(ProfileScreen);
