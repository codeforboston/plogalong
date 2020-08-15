import * as React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getRegionLeaders } from '../firebase/functions';

import $S from '../styles';
import $C from '../constants/Colors';
import { formatDuration, pluralize } from '../util';
import { useDimensions } from '../util/native';
import { useSelector } from '../redux/hooks';

import { Divider } from '../components/Elements';
import PopupDataView, { PopupHeader } from '../components/PopupDataView';
import ProfilePlaceholder from '../components/ProfilePlaceholder';
import { useNavigation } from '@react-navigation/native';


const LeaderboardErrors = {
  'not-found': {
    details: 'No such region',
    title: 'Unknown region ID'
  },
};

const Formatters = {
  regionCount: n => pluralize(n, 'plog'),
  regionMilliseconds: formatDuration,
};

/** @typedef {import('../firebase/project/functions/http').RegionLeaderboard} RegionLeaderboard */
/** @typedef {RegionLeaderboard["leaders"][number]} Leader */

/**
 * @typedef {object} LeaderboardProps
 * @property {RegionLeaderboard["leaders"]} users
 * @property {keyof Leader} [field]
 * @property {(value: number) => string} [formatValue]
 * @property {string} currentUserID
 * @property {(user: Leader, e: Event) => void} [onPressUser]
 */
/** @type {React.FunctionComponent<LeaderboardProps>} */
export const Leaderboard = props => {
  const {users, field='regionCount', formatValue=Formatters[field], currentUserID: myID,
         onPressUser} = props;
  const max = React.useMemo(() => Math.max(...users.map(u => u[field])), [users]);
  const layout = useDimensions();

  return (
    <FlatList data={users}
              onLayout={layout.onLayout}
              renderItem={({ item }) => {
                const { displayName, [field]: value, id, profilePicture } = item;
                const onPress = onPressUser ? (e => onPressUser(item, e)) : null;

                return (
                  <TouchableOpacity onPress={onPress}
                                    disabled={!onPress}
                  >
                    <View style={styles.leader}>
                      {
                        profilePicture ?
                          <Image source={{ uri: profilePicture }} style={styles.profileImage} /> :
                        <ProfilePlaceholder style={styles.profileImage}/>
                      }
                      <View style={styles.leaderInfo}>
                        <View style={styles.leaderInfoDetails}>
                          <Text style={styles.username} onPress={onPress}>
                            {displayName}{myID === id ? ' (YOU)' : ''}
                          </Text>
                          <Text style={styles.userScore}>{formatValue(value)}</Text>
                        </View>
                        <View style={{
                          backgroundColor: myID === id ? $C.secondaryColor : $C.activeColor,
                          width: value/max*layout.dimensions.width,
                          height: 5,
                        }}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={item => item.id}
              ItemSeparatorComponent={Divider}
              extraData={{ max }}
    />
  );
};

/**
 * @typedef {object} RegionLeaderboardProps
 * @property {RegionLeaderboard["region"]} region
 * @property {RegionLeaderboard["leaders"]} leaders
 * @property {string} currentUserID
 * @property {LeaderboardProps["onPressUser"]} [onPressUser]
 */
/** @type {React.FunctionComponent<RegionLeaderboardProps>} */
export const RegionLeaderboard = ({region, leaders, ...props}) => (
  <View>
    <PopupHeader
      title={`${region.county}, ${region.state}`}
      details=""
      image={null}
    />
    <Text style={$S.subheader}>Top Ploggers</Text>
    {
      leaders.length ?
        <Leaderboard users={leaders} {...props} /> :
      <>
        <Text>Nobody has plogged here yet!</Text>
      </>
    }
  </View>
);

const RegionLeaderboardScreen = () => {
  const currentUser = useSelector(state => state.users.current,
                                  (u1, u2) => (u1 && u2 && u1.uid === u2.uid));
  const navigation = useNavigation();
  const onPressUser = React.useCallback((user) => {
    navigation.navigate('User', { userID: user.id });
  }, [navigation]);

  return (
    <PopupDataView loader={params => getRegionLeaders(params.regionID)}
                   errorTitle={e => (LeaderboardErrors[e.code] || {}).title}
                   errorDetails={e => (LeaderboardErrors[e.code] || {}).details}>
      {React.useCallback(object => <RegionLeaderboard
                                     region={object.region}
                                     leaders={object.leaders}
                                     currentUserID={currentUser && currentUser.uid}
                                     onPressUser={onPressUser}
                                   />,
                         [currentUser && currentUser.uid])}
    </PopupDataView>
  );
};

const styles = StyleSheet.create({
  profileImage: {
    margin: 10,
    marginBottom: 0,
    marginTop: 0,
    width: 50,
    height: 50,
  },
  leader: {
    flexDirection: 'row',
    marginTop: 5,
  },
  leaderInfo: {
    flexShrink: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  leaderInfoDetails: {
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  username: {
    // borderWidth: 2,
    // borderColor: 'black',
    fontSize: 18,
    paddingRight: 10,
    // fontWeight: 'bold',
  },
  userScore: {
    
  }
});

export default RegionLeaderboardScreen;
