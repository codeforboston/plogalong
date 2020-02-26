import * as React from 'react';
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

import moment from 'moment';

import Colors from '../constants/Colors';
import Options from '../constants/Options';

import DefaultProfileImage from '../assets/images/profile.png';


function formatDuration(s) {
    if (s < 60)
        return `${s} seconds`;

    let m = Math.floor(s/60);
    if (m < 60)
        return `${m} minute${m === 1 ? '' : 's'}`;

    let h = Math.floor(m/60);
    return `${h} hour${h === 1 ? '' : 's'}`;
}

function formatDate(dt) {
    return moment(dt).format('MMMM Do');
}

export const Plog = ({plogInfo, currentUserID}) => {
    const navigation = useNavigation();
    const latLng = {
        latitude: plogInfo.getIn(['location', 'lat']),
        longitude: plogInfo.getIn(['location', 'lng']),
    };

    const ActivityIcon = Options.activities.get(
        plogInfo.get('activityType')
    ).icon;

    const { plogPhotos = [] } = plogInfo.toJS();

    const PloggedTrash = () => {
      let selectTrashTypes = plogInfo.get('trashTypes').map(type => 
          Options.trashTypes.get(type).title.toLowerCase()).join(', ');
      if (selectTrashTypes === '') {
          return (
              <Text>trash</Text>
          );
      } else {
          return (
              plogInfo.get('trashTypes').map(type => 
                  Options.trashTypes.get(type).title.toLowerCase()).join(', ')
          );
      };
    };

    const timeSpent = plogInfo.get('timeSpent');
    const when = plogInfo.get('when');
    const me = plogInfo.get('userID') === currentUserID;
    const showPhotos = () => {
        navigation.navigate('PhotoViewer', {
            photos: plogPhotos
        });
    };
    const userProfilePicture = plogInfo.get('userProfilePicture');

    return (
        <View>
          <View style={[styles.plogStyle, plogInfo.saving && styles.savingStyle]}>
            <Image source={userProfilePicture ? { uri: userProfilePicture } : DefaultProfileImage}
                   style={styles.profileImage} />
            <View>
              <Text style={styles.actionText}>
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
          <View style={styles.plogStyle}>
            <Text style={styles.subText}>
              Cleaned up <PloggedTrash />.
            </Text>
          </View>
        </View>
    );
};

const Divider = () => (
    <View style={styles.divider}></View>
);

const PlogList = ({plogs, currentUserID, filter, header, footer}) => (
    <FlatList data={filter ? plogs.filter(filter) : plogs}
              renderItem={({item}) => (<Plog plogInfo={item}
                                             currentUserID={currentUserID} />)}
              keyExtractor={(_, i) => ''+i}
              ItemSeparatorComponent={Divider}
              ListHeaderComponent={header}
              ListFooterComponent={footer} />
);

const styles = StyleSheet.create({
    plogStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 10,
        paddingBottom: 0
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
        color: Colors.textGray
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
