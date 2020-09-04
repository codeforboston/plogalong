import * as React from 'react';
import {
  View,
  ScrollView,
  Text
} from 'react-native';
import { shallowEqual } from 'react-redux';
import { useDispatch, useSelector } from '../redux/hooks';
import MapView, { Marker } from 'react-native-maps';

import * as actions from '../redux/actions';
import { keep } from '../util/iter';
import $S from '../styles';

import Banner from '../components/Banner';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { NavLink } from '../components/Link';
import Options from '../constants/Options';
import Colors from '../constants/Colors';
import PlogList from '../components/PlogList';


const LocalScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const likePlog = React.useCallback((...args) => {
    dispatch(actions.likePlog(...args));
  }, []);
  React.useEffect(() => {
    dispatch(actions.loadLocalHistory());
  }, []);

  const { history, currentUser, loading, location, region } = useSelector(({ log, users }) => {
    const { plogData, localPlogs } = log;

    return {
      history: keep(id => plogData[id], localPlogs).sort((a, b) => (b.when - a.when)),
      currentUser: users.current,
      loading: log.localPlogsLoading,
      location: users.location,
      region: log.region,
    };
  }, shallowEqual);

  const goToPlogScreen = React.useCallback(() => {
    navigation.navigate('Plog');
  }, [navigation]);
  const goToInviteScreen = React.useCallback(() => {
    navigation.navigate('Invite');
  }, [navigation]);
  const loadNextPage = React.useCallback(() => {
    if (!loading)
      dispatch(actions.loadLocalHistory(false));
  });

  const ActivityIcon = Options.activities.get('walking').icon;
  const noPloggers = history.length === 0 && !loading;
  // const recentCount = history.filter(plog => plog.userID !== currentUser.uid).length;
  const recentCount = history.length;

  const header = (
    <>
      <Banner>
        The best time to plog is yesterday.{'\n'}The second best time is today!
      </Banner>
      {
        region &&
          <>
            <NavLink route="Leaderboard" params={{ regionID: region.id }} style={$S.subheadLink}>
              Leaderboard
            </NavLink>
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
          loadNextPage={loadNextPage}
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

export default LocalScreen;
