import * as React from 'react';
import {
  View,
  Text
} from 'react-native';
import {connect} from 'react-redux';
import MapView, {Marker} from 'react-native-maps';

import * as actions from '../redux/actions';
import { keep } from '../util/iter';
import $S from '../styles';

import Banner from '../components/Banner';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Options from '../constants/Options';
import Colors from '../constants/Colors';
import PlogList from '../components/PlogList';


const LocalScreen = ({history, currentUser, likePlog, loading, location, loadLocalHistory, navigation, region}) => {
  React.useEffect(() => {
    loadLocalHistory();
  }, []);

  const goToPlogScreen = React.useCallback(() => {
    navigation.navigate('Plog');
  }, [navigation]);
  const ActivityIcon = Options.activities.get('walking').icon;

  // location = {latitude: 42.489637, longitude: -71.89254};

  const noPloggers = history.length === 0 && !loading;

  return (
    <View style={$S.screenContainer}>
      <PlogList plogs={history}
                currentUser={currentUser}
                likePlog={likePlog}
                loadNextPage={() => {
                  if (!loading)
                    loadLocalHistory(false);
                }}
                header={
                  <View style={{ paddingTop: 20 }}>
                    <Banner>
                      {
                        noPloggers
                          ?
                          "There are no other ploggers nearby.\nStart a trend!"
                          :
                          `There are ${history.length} ploggers nearby.`
                      }
                    </Banner>
                    {noPloggers && <>
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
                        <View style={$S.footerButtons}>
                          <Button title="Plog"
                            large primary
                            onPress={goToPlogScreen}
                          />
                          <Button title="Invite"
                            large
                            onPress={null}
                          />
                        </View>
                      </View>
                    </>}
                    {/* {
                      region &&
                        <Text style={$S.h1}>
                          {region.county}, {region.state}
                        </Text>
                    } */}
                  </View>
                }
                footer={
                  loading ?
                    <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 10 }}>
                      <Loading/>
                    </View>
                  :
                  <View style={{ height: 25 }} />
                }
      />
    </View>
  );
};

export default connect(({log, users}) => {
  const {plogData, localPlogs} = log;

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

  