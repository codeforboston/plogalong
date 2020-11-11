import * as React from 'react';
import {
  View,
  ScrollView,
} from 'react-native';
import { shallowEqual } from 'react-redux';
import { useDispatch, useSelector, usePaginatedPlogs, useLocation } from '../redux/hooks';
import MapView, { Marker } from 'react-native-maps';

import * as actions from '../redux/actions';
import $S from '../styles';

import Banner from '../components/Banner';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Options from '../constants/Options';
import Colors from '../constants/Colors';
import PlogList from '../components/PlogList';


const LocalScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const likePlog = React.useCallback((...args) => {
    dispatch(actions.likePlog(...args));
  }, []);

  const { currentUser, loading, plogIDs } =
        useSelector(({ log, users }) => {
          const { localPlogs } = log;

          return {
            plogIDs: localPlogs,
            currentUser: users.current,
            loading: log.localPlogsLoading,
          };
        }, shallowEqual);
  const location = useLocation();

  React.useEffect(() => {
    dispatch(actions.loadLocalHistory());
  }, [currentUser && currentUser.uid]);

    const goToPlogScreen = React.useCallback(() => {
      navigation.navigate('Plog');
    }, [navigation]);

  const [history, , loadNextPage] = usePaginatedPlogs(loading ? [] : plogIDs);

  const ActivityIcon = Options.activities.get('walking').icon;
  const noPloggers = history.length === 0 && !loading;
  // const recentCount = history.filter(plog => plog.userID !== currentUser.uid).length;

  if (noPloggers) {
    return (
      <ScrollView style={$S.screenContainer} contentContainerStyle={$S.scrollContentContainer}>
        <Banner>
          No nearby ploggers.{'\n'}Be the first to plog in your neighborhood!
        </Banner>
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
        </View>
      </ScrollView>);
  } else {
    return (
      <View style={[$S.scrollContentContainer, $S.screenContainer]}>
        <PlogList plogs={history}
          currentUser={currentUser}
          likePlog={likePlog}
          loadNextPage={loadNextPage}
          header={<Banner>
            The best time to plog is yesterday.{'\n'}The second best time is today!
          </Banner>}
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
