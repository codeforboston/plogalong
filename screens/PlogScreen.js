import * as React from 'react';
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { shallowEqual } from 'react-redux';
import * as FileSystem from 'expo-file-system';

import MapView, { Camera } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import Button from '../components/Button';
import Error from '../components/Error';
import PhotoButton from '../components/PhotoButton';
import { ShowHide } from '../components/Anim';
import Question from '../components/Question';
import Answer from '../components/Answer';

import Options from '../constants/Options';
import Colors from '../constants/Colors';
import $S from '../styles';

import { useSelector, useDispatch, useLocation } from '../redux/hooks';
import * as actions from '../redux/actions';
import {
  setUserData
} from '../firebase/auth';
import { formatAddress, prepareAddress, reverseGeocode } from '../util/location';
import useTimer from '../util/timer';

import PlogScreenWeather from './PlogScreenWeather';
import { useSerializableState } from '../util/native';
import LoadingIndicator from '../components/Loading';

import * as Permissions from 'expo-permissions';

class PlogScreen extends React.Component {
  static modes = ['Log'];

  constructor(props) { 
    super(props);

    this.state = {
      shouldFollow: true,
      dragging: false,
      viewHeight: 500
    }
    /** @type {Parameters<typeof Alert.alert>[]} */
    this._pendingAlerts = [];
    this._markerScale = new Animated.Value(1);
  }

  async coordInBounds({ latitude, longitude } = this.props.location) {
    const { northEast, southWest } = await this.mapView.getMapBoundaries();
    return latitude >= southWest.latitude && latitude <= northEast.latitude &&
      longitude >= southWest.longitude && longitude <= northEast.longitude;
  }

  async componentDidUpdate(prevProps, prevState) {
    if (!prevProps.timer.loaded && this.props.timer.loaded) {
      const { timer } = this.props;
      if (timer.total > 7200000) {
        this._pendingAlerts.push(['Continue?',
        'You have been plogging for two hours! Would you like to continue?',
        [
          {
            text: "Yes, continue",
            onPress: () => timer.toggle(),
          },
          {
            text: "No, reset the timer",
            onPress: () => timer.reset(),
            style: "destructive",
          }
        ]]);
      }
    }

    if (this.props.lastPlogID !== prevProps.lastPlogID) {
      this.props.timer.reset();
      this.props.setPlogState({
        trashTypes: {},
        selectedMode: 0,
        plogPhotos: [null, null, null, null, null],
        activityType: ['walking'],
        groupType: ['alone'],

        markedLocation: null,
        markedLocationInfo: null,
      });

      if (this.props.navigation.isFocused()) {
        this.props.navigation.navigate('History');
      }
    }

    if (this.props.location) {
      if (!prevProps.location ||
          (Platform.OS === 'android' && this.state.shouldFollow &&
           !(await this.coordInBounds(this.props.location)))) {
        this.mapView.animateCamera(this.makeCamera(), { duration: 200 });
      }
    }
  }

  presentPendingAlerts = () => {
    for (const alert of this._pendingAlerts) {
      Alert.alert(...alert);
    }
    this._pendingAlerts = [];
  }

  /**
   * @returns {Camera}
   */
  makeCamera = () => (this.props.location && {
    center: this.props.location,
    altitude: 1000,
    pitch: 0,
    heading: 0,
    zoom: 14
  })

  onClickRecenter = () => {
    this.props.setPlogState({
      markedLocation: null,
      markedLocationInfo: null,
    });
    this.setState({ shouldFollow: true})
    this.mapView.animateCamera(this.makeCamera(), { duration: 200 });
  }

  onPanDrag = e => {
    if (!this.props.plogState.markedLocation) {
      this._markerScale = new Animated.Value(1);

      this.props.setPlogState({
        markedLocation: e.nativeEvent.coordinate
      })
      /// XXX Probably redundant:
      this.setState({
        shouldFollow: false,
      });
    }

    if (!this.state.dragging) {
      this.setState({
        dragging: true
      });

      if (this._markerAnimation) this._markerAnimation.stop();
      this._markerAnimation =
        Animated.timing(this._markerScale, {
          duration: 200,
          easing: Easing.in(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        })
        .start();
    }
  }

  onRegionChangeComplete = region => {
    if (this.props.plogState.markedLocation) {
      const coordinates = {
        latitude: region.latitude,
        longitude: region.longitude,
      };
      this.props.setPlogState({
        markedLocation: coordinates,
      });
      this.setState({
        dragging: false,
      });

      reverseGeocode(coordinates).then(locationInfo => {
        this.props.setPlogState({ markedLocationInfo: locationInfo[0] });
      }, console.warn);

      if (this._markerAnimation) this._markerAnimation.stop();

      this._markerAnimation =
        Animated.timing(this._markerScale, {
          duration: 200,
          easing: Easing.in(Easing.ease),
          toValue: 0.667,
          useNativeDriver: true,
        }).start();
    }
  }

  changeMode = (idx) => {
    this.props.setPlogState({ selectedMode: idx });
  }

  get mode() {
    return PlogScreen.modes[this.props.plogState.selectedMode];
  }

  onSubmit = () => {
    if (!this.props.user) {
      console.warn('Unauthenticated user; skipping plog');
      return;
    }

    const coords = this.props.plogState.markedLocation || this.props.location,
          locationInfo = this.props.plogState.markedLocationInfo || this.props.locationInfo;
    const plog = {
      location: coords ? {
        lat: coords.latitude,
        lng: coords.longitude,
        name: formatAddress(locationInfo)
      } : null,
      when: new Date(),
      pickedUp: this.mode === 'Log',
      trashTypes: Object.keys(this.props.plogState.trashTypes),
      activityType: this.props.plogState.activityType[0],
      groupType: this.props.plogState.groupType[0],
      plogPhotos: this.props.plogState.plogPhotos.filter(p=> p!=null),
      timeSpent: this.props.timer.total,
      public: this.props.user.data.shareActivity,
      userProfilePicture: this.props.user.data.profilePicture,
      userDisplayName: this.props.user.data.displayName,
    };
    this.props.logPlog(plog);
  }

  toggleTrashType = (trashType) => {
    this.props.setPlogState(({trashTypes}) => {
      if (trashTypes[trashType])
        delete trashTypes[trashType];
      else
        trashTypes[trashType] = true;
      return { trashTypes };
    });
  }

  addPicture(picture, idx) {
    this.props.setPlogState(({plogPhotos}) => {
      plogPhotos = Array.from(plogPhotos);
      plogPhotos[idx] = picture;

      return { plogPhotos };
    });
  }

  selectActivityType = (activity) => {
    this.props.setPlogState({
      activityType: [activity]
    });
  }

  selectGroupType = (group) => {
    this.props.setPlogState({
      groupType: [group]
    });
  }

  toggleTimer = () => {
    this.props.timer.toggle();
  }

  clearTimer = () => {
    this.props.timer.reset();
  }

  async requestNotificationPermissions(onRequestCompletion) {
      Permissions.askAsync(Permissions.NOTIFICATIONS).then(() => {
        onRequestCompletion()
      })
  };

  formatTimer = () => {
    const difference = this.props.timer.total/1000;
    let hours   = Math.floor(difference / 3600);
    let minutes = Math.floor((difference - (hours * 3600)) / 60);
    let seconds = Math.floor(difference - (hours * 3600) - (minutes * 60));

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    return `${hours}:${minutes}:${seconds}`;
  }

  toggleDetailedOptions = () => {
    this.props.setPreferences({ showDetailedOptions: !this.props.preferences.showDetailedOptions });
  }

  renderModeQuestions(mode=this.mode) {
    const {plogState} = this.props,
          [activity] = plogState.activityType,
          [group] = plogState.groupType,
          activityName = Options.activities.get(activity).title,
          groupName = Options.groups.get(group).title;

    const dataWhat = Array.from(Options.activities)
    const dataWho = Array.from(Options.groups)

    switch (mode) {
    case 'Log':
      return (
        <>
          <Question question="What were you up to?"/>
     
          <FlatList
            data={dataWhat}
            renderItem={({ item }) =>
                  <Button title={item[1].title} 
                    value={item[0]} 
                    icon={React.createElement(item[1].icon, 
                      { fill : '#666666', resizeMode: 'contain',
                      })}
                    key={item[0]}
                    onPress={() => this.selectActivityType(item[0])} 
                    selected={item[0] === activity}
                  />
            }
            keyExtractor={item => item[0]}
            horizontal
            snapToAlignment="start"
            // snapToInterval={false}
            showsHorizontalScrollIndicator={false}
            />

          <Answer answer={activityName}/>

          <Question question="Who helped?" style={$S.h2}/>

          <FlatList
            data={dataWho}
            renderItem={({ item }) =>
                  <Button title={item[1].title} 
                    value={item[0]}
                    icon={React.createElement(item[1].icon, 
                      { fill : '#666666', resizeMode: 'contain',
                      })}
                    key={item[0]}
                    onPress={() => this.selectGroupType(item[0])} 
                    selected={item[0] === group}
                  />
            }
            keyExtractor={item => item[0]}
            horizontal
            snapToAlignment="start"
            // snapToInterval={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
            />

          <Answer answer={groupName} style={$S.h2}/>
        </>
      );
    }

    return null;
  }

  getTrashTypes = () =>
    Array.from(Options.trashTypes)
    .slice(0, this.props.preferences.showDetailedOptions ? -1 : 2)
    .concat(Array.from(Options.trashTypes).slice(-1));

  render() {
    const {props: { plogState, location }, state } = this,
          {error, preferences: { showDetailedOptions }} = this.props,
          locationInfo = plogState.markedLocationInfo || this.props.locationInfo,
          where = locationInfo && (prepareAddress(locationInfo) || { name: 'off the grid' });
    const ActivityIcon = Options.activities.get(plogState.activityType[0]).icon;

    const firstNullIdx = plogState.plogPhotos.findIndex(p => !p);
    return (
      <ScrollView 
        style={$S.screenContainer} 
        contentContainerStyle={$S.scrollContentContainer}
        onLayout={e => {
          this.setState({
            viewHeight: e.nativeEvent.layout.height
          });
        }}
        >

        <PlogScreenWeather location={location} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8, paddingTop: 10 }}>
          {
            where &&
            <>
              <View style={styles.locationText}>
                <Text style={{ }}>
                  Plogging {where.preposition}{' '}
                  </Text>
                <Text style={styles.locationName}>
                  {where.name}
                </Text>
              </View>
          </>
          }
          <Text style={styles.timer}>
            {/* <Text onPress={this.clearTimer} style={styles.clearButton}>clear</Text> */}
            <Text> </Text>
            {this.formatTimer()}
          </Text>
        </View>

        <View style={[styles.mapContainer, { height: state.viewHeight*0.5 }]}>
          <MapView
            ref={mapView => this.mapView = mapView}
            style={[styles.map]}
            initialCamera={this.makeCamera()}
            showsMyLocationButton={false}
            showsTraffic={false}
            showsUserLocation={!!location}
            followsUserLocation={!!location && this.state.shouldFollow}
            onPanDrag={this.onPanDrag}
            onRegionChangeComplete={this.onRegionChangeComplete}
            zoomControlEnabled={false}
            onMapReady={this.presentPendingAlerts}
          />
          {plogState.markedLocation &&
           <Animated.View style={[styles.markedLocationIconContainer,
                                  { transform: [{ scale: this._markerScale }]}]}
                          pointerEvents="none">
             <ActivityIcon
               width={60}
               height={60}
               fill={Colors.activeColor}
             />
           </Animated.View>
          }

          <View style={styles.timerButtonContainer} pointerEvents="box-none" >
            <Button
              title={this.props.timer.started ? 'STOP TIMER' : 'START TIMER'}
              onPress={async () => { 
                const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
                if (existingStatus !== "granted") {
                  this.requestNotificationPermissions(() => this.props.timer.toggle());
                } else {
                  this.props.timer.toggle();
                }
              }}
              style={styles.timerButton}
              selected={!!this.props.timer.started}
            />
          </View>

          <ShowHide style={styles.myLocationButtonContainer}
                    animationConfig={{ delay: 500 }}
                    shown={!this.state.shouldFollow} >
            <TouchableOpacity onPress={this.onClickRecenter}
                              accessibilityLabel="Recenter map"
                              accessibilityRole="button"
            >
              <Ionicons name="md-locate" size={20} style={styles.myLocationButton} />
            </TouchableOpacity>
          </ShowHide>

        </View>

        <View style={styles.photoStrip}>
          {
            this.props.plogState.plogPhotos.map((plogPhoto, idx) => (
              <PhotoButton onPictureSelected={picture => this.addPicture(picture, Math.min(idx, firstNullIdx))}
                           style={styles.photoButton}
                           imageStyle={{ 
                              resizeMode: 'contain',
                              width: '90%', 
                              height: '80%', 
                           }}
                           onCleared={_ => this.addPicture(null, idx)}
                           photo={plogPhoto}
                           key={idx}
                           manipulatorActions={[
                             { resize: { width: Options.plogPhotoWidth, height: Options.plogPhotoHeight } },
                           ]}
              />
            ))
          }
        </View>

        <Question question="What did you clean up?" style={$S.h2}/>
        <View style={styles.selectable} >
          {this.getTrashTypes().map(([value, type]) => (
            <Button title={type.title} value={value} icon={type.icon} key={value}
                    onPress={() => this.toggleTrashType(value)}
                    selected={plogState.trashTypes[value]}
                    style={styles.selectableItem}
            />
          ))}
        </View>
        <Button title={showDetailedOptions ? 'Hide Detailed Options' : 'Show Detailed Options'}
                onPress={this.toggleDetailedOptions}
        />

        {this.renderModeQuestions()}

        {error && <Error error={error}/>}

        <Button title={PlogScreen.modes[this.props.plogState.selectedMode]}
                disabled={!this.props.user || this.props.submitting}
                primary
                onPress={this.onSubmit}
        />
        <View style={[$S.switchInputGroup, styles.shareInLocalFeed]}>
          <Text style={$S.inputLabel}>
            Share in Local Feed
          </Text>
          <Switch value={this.props.user && (this.props.user.data || {}).shareActivity}
                  style={$S.switch}
                  onValueChange={() => { setUserData({ shareActivity: !this.props.user.data.shareActivity }); }}
          />
        </View>

      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
    photoStrip: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-around'
    },

    photoButton: {
        flex: 1,
        marginHorizontal: 7,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    mapContainer: {
        borderColor: Colors.borderColor,
        borderWidth: 1,
        flex: 1,
        height: 300,
        margin: 5,
        position: 'relative'
    },

    map: {
        width: '100%',
        height: '100%'
    },

    timerButton: {
        width: '30%',
        margin: 'auto',
        backgroundColor: 'white'
    },

    timerButtonContainer: {
        alignItems: 'center',
        position: 'absolute',
        bottom: '10%',
        left: 0,
        width: '100%'
    },

    timer: {
        textAlign: 'right',
        paddingRight: 5
    },

    locationText: {
      paddingLeft: 10,
      flexShrink: 1,
      flexDirection: 'row'
    },

    locationName: {
      fontWeight: '500',
      flexShrink: 1,
      maxHeight: 100,
    },

  myLocationButtonContainer: {
    height: '100%',
    padding: 10,
    paddingBottom: 20,
    position: 'absolute',
  },

  myLocationButton: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 5,
    borderWidth: 1,
    padding: 5,
    paddingBottom: 2,
  },

  markedLocationIconContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  clearButton: {
    color: 'grey',
    textDecorationLine: 'underline'
  },

  shareInLocalFeed: {
    margin: 10,
    marginLeft: 40,
    marginRight: 40,
    marginBottom: 20,
  },

  selectable: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start'
  },

  selectableItem: {
    flexGrow: 1
  }
});

async function restorePlogState(plogState) {
  if (plogState && plogState.plogPhotos) {
    const plogPhotos = [];
    for (const photo of plogState.plogPhotos) {
      if (photo) {
        const info = await FileSystem.getInfoAsync(photo.uri);
        if (info.exists) {
          plogPhotos.push(photo);
        }
      }
    }

    plogPhotos.push(...Array(5 - plogPhotos.length).fill(null));
    plogState.plogPhotos = plogPhotos;
  }
  return plogState;
}

export default (props) => {
  const dispatch = useDispatch();
  const dataProps = useSelector(({ preferences, users, log }) => ({
    user: users.current,
    locationInfo: users.locationInfo,
    submitting: log.submitting,
    lastPlogID: log.lastPlogID,
    error: log.logError,
    preferences,
  }), shallowEqual);
  const timer = useTimer();
  const location = useLocation();
  const [plogState, setPlogState] = useSerializableState({
    selectedMode: 0,
    trashTypes: {},
    activityType: ['walking'],
    groupType: ['alone'],
    plogPhotos: Array(5).fill(null),
  }, 'com.plogalong.plog', restorePlogState);

  const actionProps = {
    logPlog(plogInfo) {
      dispatch(actions.logPlog(plogInfo));
    },
    setPreferences: (...args) => dispatch(actions.setPreferences(...args))
  };

  if (!plogState)
    return <LoadingIndicator />;

  return <PlogScreen location={location} 
                      timer={timer}
                      plogState={plogState}
                      setPlogState={setPlogState}
                      {...dataProps} 
                      {...actionProps} 
                      {...props} />;
};
