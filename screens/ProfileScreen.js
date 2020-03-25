import * as React from 'react';
import {
    Image,
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
import { setPreferences, logout} from '../redux/actions';

import Colors from '../constants/Colors';
import $S from '../styles';
import ProfilePlaceholder from '../components/ProfilePlaceholder';


const stateFromProps =
      ({currentUser: { data: { homeBase = '',
                               displayName,
                               shareActivity = false,
                               emailUpdatesEnabled = false,
                             } = {}
                     }} = {}) => ({
                         params: {
                             displayName,
                             homeBase,
                             shareActivity,
                             emailUpdatesEnabled,
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

    save = event => {
        this.props.setUserData({...this.state.params});
    }

    setProfilePhoto = photo => {
        this.props.setUserData({ profilePicture: photo });
    }

  render() {
      const setParam = param => (text => this.setState(({params}) => ({params: { ...params, [param]: text }})));
      const toggleParam = param => (_ => {
          this.setState(({params}) => ({params: { ...params, [param]: !params[param] }}), _ => {
              this.save();
          });
      });

      const {currentUser} = this.props;
      const userData = currentUser.data || {};
      const created = new Date(parseInt(currentUser.createdAt));
      const {params} = this.state;
      const {profilePicture} = currentUser.data;

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
                 Hello, {userData.displayName||'Fellow Plogger'}!
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
                          autoCapitalize="sentences"
                          value={params.homeBase}
                          onChangeText={setParam('homeBase')}
                          onBlur={this.save}
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
                 Get email updates ({'< 1/month'})
               </Text>
               <Switch value={params.emailUpdatesEnabled} style={$S.switch} onValueChange={toggleParam('emailUpdatesEnabled')} />
             </View>
           </>}

          <View style={[styles.buttonContainer, currentUser.isAnonymous && styles.anonymousButtonContainer]}>
            <Button primary onPress={this.goToSignup} title={currentUser.isAnonymous ? 'Create Plogalong Account' : "Link Account" }/>
            <Button primary onPress={logOut} title={currentUser.isAnonymous ? 'Log in as Existing User' : 'Log Out'} />
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
      flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
  },
  profileImageButton: {
      width: 100,
      height: 80,
      marginTop: 3,
      marginLeft: -10,
      borderWidth: 0,
  },
    profileImage: {
        width: 100,
        height: 80,
        resizeMode: 'contain', 
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
  (state) => ({
      currentUser: state.users.get("current") && state.users.get('current').toJS(),
    preferences: state.preferences,
  }),
    (dispatch) => ({
        updatePreferences(preferences) {
            dispatch(setPreferences(preferences))
        },
        setUserData,
  })
)(ProfileScreen);
