import * as React from 'react';
import {
  View,
  ScrollView,
  Text
} from 'react-native';
import { connect } from 'react-redux';
import MapView, { Marker } from 'react-native-maps';

import * as actions from '../redux/actions';
import { keep } from '../util/iter';
import $S from '../styles';

import Banner from '../components/Banner';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Options from '../constants/Options';
import Colors from '../constants/Colors';
import PlogList from '../components/PlogList';


const LocalScreen = ({ history, currentUser, likePlog, loading, location, loadLocalHistory, navigation, region }) => {
  React.useEffect(() => {
    loadLocalHistory();
  }, []);

  const goToPlogScreen = React.useCallback(() => {
    navigation.navigate('Plog');
  }, [navigation]);
  const goToInviteScreen = React.useCallback(() => {
    navigation.navigate('Invite');
  }, [navigation]);
  const ActivityIcon = Options.activities.get('walking').icon;
  const noPloggers = history.length === 0 && !loading;
  // const recentCount = history.filter(plog => plog.userID !== currentUser.uid).length;
  const recentCount = history.length;

  const header = (
    <>
      <Banner>
        {
          noPloggers
            ?
            "There are no other ploggers nearby.\nStart a trend!"
            :
            recentCount === 1
              ?
              "Only 1 plogger has plogged nearby recently."
              :
              `${recentCount} ploggers have plogged nearby recently.`
        }
      </Banner>
      {
        region &&
          <>
            <Text style={$S.h1}>
              {region.county}, {region.state}
            </Text>
          </>
      }
    </>
  );

  if (noPloggers) {
    return (
      <ScrollView style={$S.screenContainer} contentContainerStyle={$S.scrollContentContainer}>
        {header}
        <View style={$S.mapContainer}>
          {location ?
            <MapView
              style={[$S.map]}
              camera={location && {
                center: location,
                pitch: 0,
                heading: 0,
                altitude: 10000,
                zoom: 14
              }}
              showsMyLocationButton={false}
              showsTraffic={false}
              showsUserLocation={false}
              zoomControlEnabled={false}
            >
              <Marker coordinate={location}
                tracksViewChanges={true}
              >
                <ActivityIcon
                  width={40}
                  height={40}
                  fill={Colors.activeColor}
                />
              </Marker>
            </MapView> :
            <View style={$S.map} />
          }
        </View>
        <View style={$S.footerButtons}>
            <Button title="Plog"
              large primary
              onPress={goToPlogScreen}
            />
            <Button title="Invite"
              large
              onPress={goToInviteScreen}
            />
        </View>
      </ScrollView>);
  } else {
    return (
      <View style={[$S.scrollContentContainer, $S.screenContainer]}>
        <PlogList plogs={history}
          currentUser={currentUser}
          likePlog={likePlog}
          loadNextPage={() => {
            if (!loading)
              loadLocalHistory(false);
          }}
          header={
            <View style={{ paddingTop: 20 }}>
              {header}
            </View>
          }
          footer={
            loading ?
              <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 10 }}>
                <Loading />
              </View>
              :
              <View style={{ height: 25 }} />
          }
        />
      </View>
    );
  }
};

export default connect(({ log, users }) => {
  const { plogData, localPlogs } = log;

  return {
    history: keep(id => plogData[id], localPlogs).sort((a, b) => (b.when - a.when)),
    currentUser: users.current,
    loading: log.localPlogsLoading,
    location: users.location,
    region: log.region,
  };
}, dispatch => ({
  likePlog: (...args) => dispatch(actions.likePlog(...args)),
  loadLocalHistory: (...args) => dispatch(actions.loadLocalHistory(...args)),
}))(LocalScreen);
