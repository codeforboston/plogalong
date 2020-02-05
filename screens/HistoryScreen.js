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

    console.log('plogInfo: ', plogInfo);

    return (
        <View>
            <View style={styles.plogStyle}>
                <Image source={ProfileImage} style={styles.profileImage} />
                <View>
                    <Text style={styles.actionText}>
                        You plogged {plogInfo.getIn(['location', 'name'])}.
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
                <ScrollView contentContainerStyle={styles.photos}>
                    {plogPhotos.map(({uri}) => (<Image source={{uri}} key={uri} style={{width: 'auto', height: 100, marginBottom: 10}}/>))}
                </ScrollView>
            </View>
            <View style={styles.plogStyle}>
                <Text style={styles.subText}>
                    Cleaned up {plogInfo.get('trashTypes').map(type => Options.trashTypes.get(type).title.toLowerCase()).join(', ')}.
                </Text>
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
            <ScrollView style={styles.container}>
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
                <FlatList data={this.props.history.toArray()}
                        renderItem={({item}) => (<Plog plogInfo={item} />)}
                        keyExtractor={(_, i) => ''+i}
                        ItemSeparatorComponent={Divider}>
                </FlatList>
                <View style={{ height: 25 }} />
            </ScrollView>
        </View>
    );
  }
}

const styles = StyleSheet.create({
    plogStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 10,
        paddingBottom: 0
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#DCDCDC',
        marginTop: 10
    },
    profileImage: {
        margin: 10
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


export default connect(store => ({
    history: store.log.get('history').sort((a, b) => (b.get('when') - a.get('when')))
}))(HistoryScreen);
