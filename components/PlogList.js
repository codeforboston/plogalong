import * as React from 'react';
import { useCallback } from 'react';
import {
  FlatList,
  Image,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import moment from 'moment';

import * as actions from '../redux/actions';
import { formatDate, formatDuration } from '../util';
import { usePlogs } from '../redux/hooks';
import { usePrompt } from '../Prompt';
import Colors from '../constants/Colors';
import Options from '../constants/Options';

import ProfilePlaceholder from './ProfilePlaceholder';


const formatTrashTypes = (trashTypes=[]) =>
      (!trashTypes || !trashTypes.length ? 'trash' :
       trashTypes.map(type => Options.trashTypes.get(type).title.toLowerCase()).join(', '));

const MiniPlog = ({plogID}) => {
  const plog = usePlogs(plogID);

  if (plog.status) {
    return <Text>{plog.status}</Text>;
  }

  const {
    timeSpent, userID, userDisplayName, userProfilePicture, when, groupType
  } = plog;
  const ratio = PixelRatio.getFontScale();
  const { icon: GroupIcon } = groupType && Options.groups.get(groupType) || Options.groups.get('alone');

  return (
    <View>
      <View style={styles.plogStyle}>
        {
          userProfilePicture ?
            <Image source={{ uri: userProfilePicture }} style={styles.profileImage} /> :
          <ProfilePlaceholder style={styles.profileImage} />
        }
        <View style={styles.plogInfo}>
          <Text style={styles.actionText} adjustsFontSizeToFit>
            <Text style={{ fontWeight: '500'}}>
              {((userDisplayName||'').trim() || 'Anonymous') + ' '}
            </Text>
            plogged {timeSpent ? `for ${formatDuration(timeSpent, false)}` : formatDate(new Date(when))}.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 8 }}>
            <Text style={styles.subText}>
              {moment(when).fromNow()}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.plogStyle, styles.detailsStyle]}>
        <GroupIcon fill={ Colors.textGray }
                   width={20*ratio}
                   height={20*ratio}
                   style={[styles.whoPlogged, { marginRight: 5*ratio }]}
                   accessibilityLabel={`Plogged `}
        />
        <Text style={styles.subText}>
          Cleaned up {formatTrashTypes(plog.trashTypes)}.
        </Text>
      </View>
    </View>
  );
};

const Plog = ({plogInfo, currentUserID, liked, likePlog, navigation, deletePlog, onLongPress}) => {
  const { status, error } = plogInfo;
  if (status) {
    return (
      <View style={styles.plogStyle}>
        {error &&
         <Ionicons name="ios-alert"
                   size={20}
                   color="maroon"
         style={{ margin: 10 }}
         />}
        <Text style={[styles.plogInfo, styles.plogStatusText]}>{
          status === 'error' || error ? `Error while loading plog: ${error}`:
          status === 'deleted' ? 'Deleted plog' :
            'Loading'
        }</Text>
      </View>
    );
  }

  const {
    id, location: { lat, lng }, likeCount, plogPhotos = [], timeSpent,
    trashTypes = [], userID, userDisplayName, userProfilePicture, when,
    saving, groupType
  } = plogInfo;

  // Callbacks
  const onHeartPress = useCallback(() => {
    likePlog(id, !liked);
  }, [id, liked]);

  const showPhotos = useCallback(() => {
    navigation.navigate('PhotoViewer', {photos: plogPhotos || []});
  }, [plogInfo]);

  const showUser = useCallback(() => {
    navigation.navigate('User', { userID: userID });
  }, [userID]);

  const longPress = useCallback(() => {
    if (onLongPress)
      onLongPress(plogInfo);
  }, [onLongPress, plogInfo]);

  const ActivityIcon = Options.activities.get(
    plogInfo.activityType
  ).icon;

  const latLng = { latitude: lat, longitude: lng };
  const me = userID === currentUserID;
  const { icon: GroupIcon } = groupType && Options.groups.get(groupType) || Options.groups.get('alone');
  const ratio = PixelRatio.getFontScale();

  return (
    <View>
      <View style={[styles.plogStyle, saving || plogInfo._deleting && styles.savingStyle]}>
        <TouchableOpacity onPress={showUser}>
          {
            userProfilePicture ?
              <Image source={{ uri: userProfilePicture }} style={styles.profileImage} /> :
            <ProfilePlaceholder style={styles.profileImage} />
          }
        </TouchableOpacity>
        <View style={styles.plogInfo}>
          <Text style={styles.actionText} adjustsFontSizeToFit>
            {me ?
             'You' :
             <Text style={{ fontWeight: '500'}} onPress={showUser}>
               {(userDisplayName||'').trim() || 'Anonymous'}
             </Text>
            } plogged {timeSpent ? `for ${formatDuration(timeSpent, false)}` : formatDate(new Date(when))}.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 8 }}>
            <Text style={styles.subText}>
              {moment(when).fromNow()}
            </Text>
            <TouchableOpacity onPress={onHeartPress}>
              <View style={styles.likeCount}>
                {likeCount - (liked ? 1 : 0) > 0 && <Text style={styles.likeCountText}>{likeCount}</Text>}
                <Ionicons
                  size={20 * ratio}
                  name={'md-heart'}
                  color={liked ? Colors.selectionColor : Colors.activeGray}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.plogStyle}>
        <MapView
          style={styles.map}
          region={{
            ...latLng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.04,
          }}
          showsMyLocationButton={false}
          scrollEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          zoomEnabled={false}
          liteMode={true}
          cacheEnabled={true}
          onLongPress={longPress}
        >
          <Marker coordinate={latLng}
                  tracksViewChanges={false}
          >
            <ActivityIcon
              width={40}
              height={40}
              fill={Colors.activeColor}
            />
          </Marker>
        </MapView>
        {
          plogPhotos && plogPhotos.length ?
            <ScrollView contentContainerStyle={styles.photos}>
              {plogPhotos.map(({uri}) => (
                <TouchableOpacity onPress={showPhotos} key={uri}>
                  <Image source={{uri}}
                         key={uri}
                         style={styles.plogPhoto}/>
                </TouchableOpacity>))}
            </ScrollView> :
          null
        }
      </View>
      <View style={[styles.plogStyle, styles.detailsStyle]}>
        <GroupIcon fill={ Colors.textGray }
                   width={20*ratio}
                   height={20*ratio}
                   style={[styles.whoPlogged, { marginRight: 5*ratio }]}
                   accessibilityLabel={`Plogged `}
        />
        <Text style={styles.subText}>
          Cleaned up {formatTrashTypes(trashTypes)}.
        </Text>
      </View>
    </View>
  );
};

const Divider = () => (
  <View style={styles.divider}></View>
);

const doesUserLikePlog = (user, plogID) => {
  return !!(user && user.data && user.data.likedPlogs && user.data.likedPlogs[plogID]);
};

const likedPlogIds = user => (
  user && user.data && user.data.likedPlogs && JSON.stringify(user.data.likedPlogs)
);

const PlogList = ({plogs, currentUser, filter, header, footer, likePlog, deletePlog, reportPlog, loadNextPage}) => {
  const navigation = useNavigation();

  const { prompt } = usePrompt();
  const onReportPlog = useCallback(async plogInfo => {
    const me = currentUser && plogInfo.userID === currentUser.uid;

    if (me) {
      Alert.alert('Delete plog?', 'This plog will be gone forever', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress() { deletePlog(plogInfo); }
        }
      ]);
    } else {
      const result = await prompt({
        title: 'Report plog?',
        message: 'Do you really want to report this plog?',
        body: <MiniPlog plogID={plogInfo.id} />,
        value: '',
        options: [
          {
            title: 'Report',
            value: 'report',
            run: () => {
              reportPlog(plogInfo.id);
            }
          },
          {
            title: 'Nevermind',
            run: () => {}
          }
        ]
      });
    }
  }, [currentUser.uid]);

  return (
    <FlatList data={filter ? plogs.filter(filter) : plogs}
              renderItem={({item}) => (
                <Plog plogInfo={item}
                      currentUserID={currentUser && currentUser.uid}
                      liked={doesUserLikePlog(currentUser, item.id)}
                      likePlog={likePlog}
                      deletePlog={deletePlog}
                      reportPlog={reportPlog}
                      navigation={navigation}
                      onLongPress={onReportPlog}
                />)}
              initialNumToRender={3}
              onEndReachedThreshold={0.5}
              onEndReached={loadNextPage}
              keyExtractor={(item) => item.id}
              extraData={likedPlogIds(currentUser)}
              ItemSeparatorComponent={Divider}
              ListHeaderComponent={header}
              ListFooterComponent={footer} />
  );
};

const styles = StyleSheet.create({
  plogStyle: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
    paddingBottom: 0,
  },
  plogInfo: {
    paddingTop: 5,
    flex: 1
  },
  plogPhoto: {
    width: 'auto',
    height: 100,
    marginBottom: 10
  },
  whoPlogged: {
    alignSelf: 'flex-start',
    flex: 0,
    marginLeft: 5,
    marginRight: 5,
  },
  detailsStyle: {
    justifyContent: 'space-between',
  },
  likeCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCountText: {
    marginRight: 8,
  },
  savingStyle: {
    opacity: 0.8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC',
    marginTop: 10
  },
  profileImage: {
    margin: 10,
    marginBottom: 0,
    marginTop: 0,
    width: 50,
    height: 50,
  },
  actionText: {
    fontSize: 18
  },
  subText: {
    color: Colors.textGray,
    flex: 1
  },
  map: {
    borderColor: Colors.borderColor,
    borderWidth: 1,
    flex: 3,
    height: 300,
    margin: 5,
    marginTop: 0,
  },
  photos: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    height: 300,
    overflow: 'scroll',
    margin: 5,
    flex: 1
  },
  plogStatusText: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: Colors.inactiveGray,
    paddingBottom: 6
  },
  loadError: {
    color: Colors.errorBackground
  }
});

export default connect(null, dispatch => ({
  likePlog: (...args) => dispatch(actions.likePlog(...args)),
  deletePlog: (...args) => dispatch(actions.deletePlog(...args)),
  reportPlog: (...args) => dispatch(actions.reportPlog(...args)),
}))(PlogList);
