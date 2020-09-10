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
import $C from '../constants/Colors';
import { pluralize } from '../util';
import * as users from '../util/users';

import PopupDataView, { PopupHeader } from '../components/PopupDataView';
import ProfilePlaceholder from '../components/ProfilePlaceholder';
import { NavLink } from '../components/Link';
import { useSelector } from '../redux/hooks';
import AchievementView from '../components/AchievementView';


const ProfileErrors = {
  'not-found': {
    details: 'No such user'
  },
  'permission-denied': {
    details: 'That user prefers to keep their plogs to themselves',
    title: 'Profile private'
  }
};

const UserProfile = ({user, plogs}) => {
  const currentUser = useSelector(state => state.users.current);

  return (
    <View style={styles.container}>
      <PopupHeader
        title={user.displayName}
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
                //data={filter ? plogs.filter(filter) : plogs}
                renderItem={({item}) => (
                  <AchievementView 
                    item={item}
                    achievement={item.achievement}
                  />
                )}
      />
{/*
      <FlatList data={users.processAchievements(user.achievements, { partial: false })}
                renderItem={({item}) => (
                  <View style={styles.achievement}>
                    {React.createElement(item.icon, {
                      fill: $C.selectionColor,
                      style: styles.achievementBadge,
                      height: 45,
                      width: 45,
                    })}
                    <View style={styles.achievementInfo}>
                      <Text style={$S.itemTitle}>{ item.badgeTheme }</Text>
                      <Text>
                        Completed {moment(item.completed.toDate()).fromNow()}
                      </Text>
                    </View>
                  </View>
                )}
      />
*/}
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
  achievement: {
    flexDirection: 'row',
    marginLeft: 10,
    marginBottom: 10,
  },
  achievementBadge: {
    marginRight: 15,
  },
  achievementInfo: {
    flexDirection: 'column',
    justifyContent: 'center'
  },
  profileLink: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: 'right'
  }
});

export default UserScreen;
