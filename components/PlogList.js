import * as React from 'react';
import { useCallback } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import moment from 'moment';

import { formatDuration } from '../util';
import Colors from '../constants/Colors';
import Options from '../constants/Options';

import DefaultProfileImage from '../assets/images/profile.png';
import ProfilePlaceholder from './ProfilePlaceholder';

function formatDate(dt) {
    return moment(dt).format('MMMM Do');
}

export const Plog = ({plogInfo, currentUserID, liked, likePlog}) => {
    const navigation = useNavigation();
    const latLng = {
        latitude: plogInfo.getIn(['location', 'lat']),
        longitude: plogInfo.getIn(['location', 'lng']),
    };

    const ActivityIcon = Options.activities.get(
        plogInfo.get('activityType')
    ).icon;

  const { plogPhotos = [], timeSpent, when, userID, userProfilePicture, likeCount } = plogInfo.toJS();
  const me = userID === currentUserID;

  const onHeartPress = useCallback(() => {
    likePlog(plogInfo.get('id'), !liked);
  }, [liked]);
  const showPhotos = useCallback(() => {
    navigation.navigate('PhotoViewer', {
      photos: plogPhotos
    });
  }, []);


    return (
        <View>
          <View style={[styles.plogStyle, plogInfo.saving && styles.savingStyle]}>
            {
              userProfilePicture ?
                <Image source={{ uri: userProfilePicture }} style={styles.profileImage} /> :
              <ProfilePlaceholder style={styles.profileImage} />
            }
            <View style={styles.plogInfo}>
              <Text style={styles.actionText} adjustsFontSizeToFit>
                {me ? 'You' : plogInfo.get('userDisplayName', 'A fellow plogger')} plogged {timeSpent ? `for ${formatDuration(timeSpent)}` : `on ${formatDate(new Date(when))}`}.
              </Text>
              <Text style={styles.subText}>
                {moment(plogInfo.get('when')).fromNow()}
              </Text>
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
              zoomEnabled={false}
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
                            <Image source={{uri}} key={uri} style={{width: 'auto', height: 100, marginBottom: 10}}/>
                          </TouchableOpacity>))}
                    </ScrollView> :
                null
            }
          </View>
          <View style={[styles.plogStyle, styles.detailsStyle]}>
            <Text style={styles.subText}>
              Cleaned up {plogInfo.get('trashTypes').map(type => Options.trashTypes.get(type).title.toLowerCase()).join(', ')}.
            </Text>
            <TouchableOpacity onPress={onHeartPress}>
              <View style={styles.likeCount}>
                {likeCount - (liked ? 1 : 0) > 0 && <Text style={styles.likeCountText}>{likeCount}</Text>}
                <Ionicons size={20} name={liked ? 'md-heart' : 'md-heart-empty'}/>
              </View>
            </TouchableOpacity>
          </View>
        </View>
    );
};

const Divider = () => (
    <View style={styles.divider}></View>
);

const doesUserLikePlog = (user, plogID) => {
  return (user && user.data && user.data.likedPlogs && user.data.likedPlogs[plogID]);
};

const PlogList = ({plogs, currentUser, filter, header, footer, likePlog}) => (
    <FlatList data={filter ? plogs.filter(filter) : plogs}
              renderItem={({item}) => (<Plog plogInfo={item}
                                             currentUserID={currentUser && currentUser.uid}
                                             liked={doesUserLikePlog(currentUser, item.get('id'))}
                                             likePlog={likePlog} />)}
              keyExtractor={(item) => item.get('id')}
              ItemSeparatorComponent={Divider}
              ListHeaderComponent={header}
              ListFooterComponent={footer} />
);

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
        margin: 5
    },
    photos: {
        flexDirection: 'column',
        alignSelf: 'stretch',
        justifyContent: 'flex-start',
        height: 300,
        overflow: 'scroll',
        margin: 5,
        flex: 1
    }
});

export default PlogList;
