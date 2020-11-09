import * as React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import moment from 'moment';
import { loadUserProfile } from '../firebase/functions';

import $S from '../styles';
import { pluralize } from '../util';
import * as users from '../util/users';

import PopupDataView, { PopupHeader } from '../components/PopupDataView';
import ProfilePlaceholder from '../components/ProfilePlaceholder';
import { NavLink } from '../components/Link';
import { useSelector } from '../redux/hooks';
import Unlocked from '../components/Unlocked';


const ProfileErrors = {
  'not-found': {
    details: 'No such user'
  },
  'permission-denied': {
    details: 'That user prefers to keep their plogs to themselves',
    title: 'Profile private'
  }
};

const UserProfile = ({user}) => {
  const currentUser = useSelector(state => state.users.current);

  return (
    <View style={styles.container}>
      <PopupHeader
        title={user.displayName || 'Mysterious Plogger'}
        details={
          `Started plogging ${moment(user.created).fromNow()}\nLast seen ${moment(user.last).fromNow()}\nPlogged ${pluralize(user.plogCount, 'time')}`
        }
        image={
          user.profilePicture ?
            <Image source={{ uri: user.profilePicture }}/> :
          <ProfilePlaceholder/>
        }
      />
      <Text style={$S.subheader}>Achievements</Text>
      <FlatList data={users.processAchievements(user.achievements, { partial: false })}
                renderItem={({item}) => (
                  <Unlocked icon={item.icon}
                            title={item.badgeTheme}
                            description={`Completed ${moment(item.completed.toDate()).fromNow()}`}
                            style={{ padding: 10 }}
                  />
                )}
      />
      <View style={{ flex: 1 }}/>
    {currentUser && currentUser.uid === user.id &&
     <Text style={styles.profileLink}>
       This is your public profile. {'\n'}
       <NavLink route="Profile">Modify your settings</NavLink>
     </Text>}
    </View>
  );
};


const UserScreen = () => (
  <PopupDataView loader={params => loadUserProfile(params.userID)}
                 errorTitle={e => (ProfileErrors[e.code] || {}).title}
                 errorDetails={e => (ProfileErrors[e.code] || {}).details}>
    {React.useCallback(object => <UserProfile user={object}/>, [])}
  </PopupDataView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  profileLink: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: 'right'
  }
});

export default UserScreen;
