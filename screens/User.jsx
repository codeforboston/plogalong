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

import DismissButton from '../components/DismissButton';
import Error from '../components/Error';
import Loading from '../components/Loading';
import ProfilePlaceholder from '../components/ProfilePlaceholder';


const UserProfile = ({user}) => (
  <View>
    <View style={styles.profileHeader}>
      {
      user.profilePicture ?
        <Image style={styles.profilePicture}
               source={{ uri: user.profilePicture }}/> :
        <ProfilePlaceholder style={styles.profilePicture} />
      }
      <View style={styles.profileDetails}>
        <Text style={styles.profileName} adjustsFontSizeToFit={true}>
          { user.displayName }
        </Text>
        <View style={{ flex: 1 }}/>
        <Text>
          Started plogging {moment(user.created).fromNow()}
          {'\n'}
          Last seen {moment(user.last).fromNow()}
          {'\n'}
          Plogged {pluralize(user.plogCount, 'time')}
        </Text>
      </View>
    </View>
    <Text style={$S.subheader}>Achievements</Text>
    <FlatList data={users.processAchievements(user.achievements, false)}
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

class UserScreen extends React.Component {
  state = {
    error: null,
    userID: null,
    loading: true,
    user: null
  }

  loadUserProfile = async () => {
    try {
      const { userID } = this.props.route.params;
      this.setState({
        loading: true,
        userID
      });
      const user = await loadUserProfile(userID);
      this.setState({ user });
    } catch (err) {
      this.setState({
        error: err
      });
    } finally {
      this.setState({
        loading: false,
      });
    }
  }

  componentDidMount() {
    this.loadUserProfile();
  }

  componentDidUpdate(prevProps) {
    // this.loadUserProfile();
  }

  renderLoading() {
    return <Loading style={{ marginTop: 150 }}/>;
  }

  render() {
    const {error, loading, user} = this.state;

    return (
      <View style={[styles.container, $S.form]}>
        <DismissButton color="black" shouldClearError={true}/>
        {loading ? this.renderLoading() : <UserProfile user={user} />}
      </View>
    );
  }
}

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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePicture: {
    width: '40%',
    height: 140,
    marginRight: 10,
  },
  profileDetails: {
    flexDirection: 'column',
    flex: 1,
  },
  profileName: {
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
