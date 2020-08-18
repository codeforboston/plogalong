import * as React from 'react';
import { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { loadUserProfile } from '../firebase/functions';

import $S from '../styles';
import $C from '../constants/Colors';
import { pluralize } from '../util';
import * as users from '../util/users';

import DismissButton from '../components/DismissButton';
import Loading from '../components/Loading';
import ProfilePlaceholder from '../components/ProfilePlaceholder';


const ProfileErrors = {
  'not-found': {
    details: 'No such user'
  },
  'permission-denied': {
    details: 'That user prefers to keep their plogs to themselves',
    title: 'Profile private'
  }
};

const PopupHeader = ({title, image, details}) => (
  <View style={styles.popupHeader}>
    {
      image && React.cloneElement(image, { style: [styles.popupHeaderPicture, image.props.style] })
    }
    <View style={styles.popupHeaderDetails}>
      <Text style={styles.popupHeaderTitle} adjustsFontSizeToFit={true}>
        {title}
      </Text>
      <View style={{ flex: 1 }}/>
      <Text>{details}</Text>
    </View>
  </View>
);

const UserProfile = ({user}) => (
  <View>
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
              renderItem={({item}) => (
                <View style={styles.achievement}>
                  {React.createElement(item.icon, {
                    fill: $C.selectionColor,
                    style: styles.achievementBadge,
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
  </View>
);

const UserScreen = () => {
  const { params: { userID } } = useRoute();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    setLoading(true);
    loadUserProfile(userID)
      .then(setUser, setError)
      .finally(_ => setLoading(false));
  }, [userID]);

  if (loading)
    return <Loading style={{ marginTop: 150 }}/>;

  if (error) {
    const e = ProfileErrors[error.code];
    return (
      <PopupHeader
        title={e && e.title || error.details || error.message}
        image={<Ionicons name={'ios-alert'} size={60} color="maroon" style={{ textAlign: 'center' }} />}
        details={e && e.details}
      />
    );
  }

  return (
    <View style={[styles.container, $S.form]}>
      <DismissButton color="black"/>
      {loading ? this.renderLoading() :
       error ? this.renderError(error) :
       <UserProfile user={user} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  containerLoading: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  popupHeaderPicture: {
    width: '35%',
    height: 140,
    marginRight: 10,
  },
  popupHeaderDetails: {
    flexDirection: 'column',
    flex: 1,
  },
  popupHeaderTitle: {
    fontSize: 30,
  },
  achievement: {
    flexDirection: 'row',
    marginLeft: 10,
    marginBottom: 10,
  },
  achievementBadge: {
    marginRight: 10
  },
  achievementInfo: {
    flexDirection: 'column',
    justifyContent: 'center'
  }
});

export default UserScreen;
