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

import $C from '../constants/Colors';
import { formatDuration, pluralize } from '../util';
import { useSelector } from '../redux/hooks';
import Colors from '../constants/Colors';

import { Divider1 } from '../components/Elements1';
import PopupDataView from '../components/PopupDataView';
import UserPicture from '../components/UserPicture';
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
 * @property {React.ComponentType<any> | React.ReactElement} [header]
 */
/** @type {React.FunctionComponent<LeaderboardProps>} */
export const Leaderboard = props => {
  const {users, field='regionCount', formatValue=Formatters[field], currentUserID: myID,
         onPressUser} = props;
  const max = React.useMemo(() => Math.max(...users.map(u => u[field])), [users]);

  return (
    <FlatList data={users}
              ListHeaderComponent={props.header}
              ListEmptyComponent={<Text>Nobody has plogged here yet!</Text>}
              renderItem={({ item }) => {
                const { displayName, [field]: value, id, profilePicture } = item;
                const onPress = onPressUser ? (e => onPressUser(item, e)) : null;

                return (
                  <TouchableOpacity onPress={onPress}
                                    disabled={!onPress}
                                    style={{paddingBottom: 5,}}
                  >
                    <View style={styles.leader}>
                      <UserPicture url={profilePicture} />
                      <View style={styles.leaderInfo}>
                        <View style={styles.leaderInfoDetails}>
                          <Text style={styles.username} onPress={onPress}>
                            {displayName}{myID === id ? ' (YOU)' : ''}
                          </Text>
                          <Text style={styles.userScore}>{formatValue(value)}</Text>
                        </View>
                        <View style={{
                          backgroundColor: myID === id ? $C.secondaryColor : $C.activeColor,
                          width: (value/max * 100) + '%',
//                          height: 5,
                          height: 15,
                        }}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={item => item.id}
//              ItemSeparatorComponent={Divider1}
              extraData={{ max }}
              style={{ height: '100%' }}
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
        <Leaderboard users={leaders}
                     header={<Text style={styles.leaderboardSubheader}>
                                Top Ploggers in your county
                             </Text>}
                     {...props} />
  </View>
);

const RegionLeaderboardScreen = ({ regionID }) => {
  const currentUser = useSelector(state => state.users.current,
                                  (u1, u2) => (u1 && u2 && u1.uid === u2.uid));
  const navigation = useNavigation();
  const onPressUser = React.useCallback((user) => {
    navigation.navigate('User', { userID: user.id });
  }, [navigation]);
  const loader = React.useCallback(() => getRegionLeaders(regionID), [regionID]);

  return (
    <PopupDataView loader={loader}
                   errorTitle={e => (LeaderboardErrors[e.code] || {}).title}
                   errorDetails={e => (LeaderboardErrors[e.code] || {}).details}
                   style={{ padding: 0, paddingTop: 10, backgroundColor: 'transparent' }}
                   hideDismissButton >
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
  leader: {
    flexDirection: 'row',
    marginTop: 5,
    paddingBottom: 10,
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
//    alignItems: 'center',
    paddingBottom: 0,
    marginBottom: 0,
    width: '100%'
  },
  username: {
    // borderWidth: 2,
    // borderColor: 'black',
    fontSize: 18,
    paddingRight: 10,
    // fontWeight: 'bold',
  },
  userScore: {
    fontSize: 18,
    alignItems: 'flex-end',  
  },
  leaderboardSubheader: {
    color: Colors.activeColor,
    fontWeight: 'bold',
    fontSize: 18,
    paddingBottom: 10,
    textAlign: 'center',
  }
});

export default RegionLeaderboardScreen;
