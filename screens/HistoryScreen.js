import React from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import moment from 'moment';

import {connect} from 'react-redux';
import Colors from '../constants/Colors';
import Options from '../constants/Options';

import ProfileImage from '../assets/images/profile.png';

//import AchievementBadge from '../components/AchievementBadge';
import HistoryBanner from '../components/HistoryBanner';
import AchievementSwipe from '../components/AchievementSwipe';

const Plog = ({plogInfo}) => {
    const latLng = {
        latitude: plogInfo.getIn(['location', 'lat']),
        longitude: plogInfo.getIn(['location', 'lng']),
    };

    const ActivityIcon = Options.activities.get(
        plogInfo.get('activityType')
    ).icon;

    const { plogPhotos = [] } = plogInfo.toJS();

    return (
        <View>
            <View style={styles.plogStyle}>
                <Image source={ProfileImage} style={styles.profileImage} />
                <View>
                    <Text styles={styles.actionText}>
                        You {plogInfo.get('pickedUp') ? 'picked up' : 'flagged'}&nbsp;
                        {plogInfo.get('trashTypes').join(', ')} at {JSON.stringify(plogInfo.get('location'))}
                    </Text>
                    <Text styles={styles.timeText}>
                        {moment(plogInfo.get('when')).fromNow()}
                    </Text>
                </View>
            </View>
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
                <Marker
                    coordinate={latLng}
                    tracksViewChanges={false}
                >
                    <ActivityIcon
                        width={40}
                        height={40}
                        fill={Colors.activeColor}
                    />
                </Marker>
            </MapView>
            <View style={{flexDirection: 'row'}}>
              {plogPhotos.map(({uri}) => (<Image source={{uri}} key={uri} style={{flex: 0, width: 150, height: 150}}/>))}

            </View>
        </View>
    )
};

const Divider = () => (
    <View style={styles.divider}></View>
);

class HistoryScreen extends React.Component {
  render() {
    return (
        <View>
            <HistoryBanner />
            <View style={{
                marginLeft: 20,
                marginTop: 10
            }}>
                <Text style={{
                    fontSize: 25,
                    marginLeft: 5,
                    color: Colors.textGray
                }}>Achievements</Text>
                <AchievementSwipe />
            </View>
            <ScrollView style={styles.container}>
                <FlatList data={this.props.history.toArray()}
                        renderItem={({item}) => (<Plog plogInfo={item} />)}
                        keyExtractor={(_, i) => ''+i}
                        ItemSeparatorComponent={Divider}>
                </FlatList>
            </ScrollView>
        </View>
    );
  }
}

const styles = StyleSheet.create({
    plogStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 10
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: 'gray'
    },
    profileImage: {
        margin: 10
    },
    actionText: {

    },
    timeText: {

    },
    map: {
        borderColor: Colors.borderColor,
        borderWidth: 1,
        flex: 1,
        height: 300,
        margin: 5
    }
});


export default connect(store => ({
    history: store.log.get('history').sort((a, b) => (b.get('when') - a.get('when')))
}))(HistoryScreen);
