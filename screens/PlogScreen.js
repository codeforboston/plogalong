import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    View,
    Switch,
    Text
} from 'react-native';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';

import { Set } from 'immutable';

import Banner from '../components/Banner';
import Button from '../components/Button';
import PlogPhoto from '../components/PlogPhoto';
import Question from '../components/Question';
import Selectable from '../components/Selectable';

import Options from '../constants/Options';
import Colors from '../constants/Colors';
import $S from '../styles';

import {connect} from 'react-redux';
import * as actions from '../redux/actions';

import PlogScreenWeather from './PlogScreenWeather';


class PlogScreen extends React.Component {
    static modes = ['Log'];

    constructor(props) {
        super(props);
        this.state = {
            selectedMode: 0,
            trashTypes: Set([]),
            activityType: ['walking'],
            groupType: ['alone'],
            plogPhotos: [null, null, null, null, null],
            timerInterval: null,
            plogStart: null,
            plogTotalTime: 0,
            plogTimer: '00:00:00',
            params: {
                homeBase: 'Boston, MA',
                username: 'Beach Bum'
            }
        };
    }

    changeMode = (idx) => {
        this.setState({ selectedMode: idx });
    }

    get mode() {
        return PlogScreen.modes[this.state.selectedMode];
    }

    onSubmit = () => {
        const coords = this.state.location && this.state.location.coords;
        const plog = {
            location: coords ? {lat: coords.latitude, lng: coords.longitude, name: 'beach'} : null,
            when: new Date(),
            pickedUp: this.mode === 'Log',
            trashTypes: this.state.trashTypes.toJS(),
            activityType: this.state.activityType[0],
            groupType: this.state.groupType[0],
            plogPhotos: this.state.plogPhotos.filter(p=> p!=null),
            timeSpent: this.state.plogTotalTime + (this.state.plogStart ? Date.now() - this.state.plogStart : 0)
        };
        this.props.logPlog(plog);
        Alert.alert('Achievement Unlocked!', 'Break the seal: first plogger in the neighborhood', [{text: 'OK!'}]);
        this.setState({
            trashTypes: Set([]),
            selectedMode: 0,
            plogPhotos: [null, null, null, null, null],
            timerInterval: clearInterval(this.state.timerInterval),
            plogStart: null,
            plogTotalTime: 0,
            plogTimer: '00:00:00',
        });
    }

    toggleTrashType = (trashType) => {
        this.setState(({trashTypes}) => ({
            trashTypes: trashTypes.has(trashType) ? trashTypes.delete(trashType) : trashTypes.add(trashType)
        }));
    }

    addPicture(picture, idx) {
        this.setState(({plogPhotos}) => {
            plogPhotos[idx] = picture;

            return { plogPhotos };
        });
    }

    selectActivityType = (activity) => {
        this.setState(state => ({
            activityType: [activity]
        }));
    }

    selectGroupType = (group) => {
        this.setState(state => ({
            groupType: [group]
        }));
    }

    toggleTimer = () => {
        if(this.state.timerInterval) {
            this.setState(prevState => ({
                timerInterval: clearInterval(this.state.timerInterval),
                plogTotalTime: prevState.plogTotalTime + Date.now() - prevState.plogStart,
                plogStart: null
            }));
        } else {
            this.setState(prevState => ({
                timerInterval: setInterval(this.tick, 1000),
                plogStart: Date.now()
            }));
        }
    }

    clearTimer = () => {
        this.setState({
            timerInterval: clearInterval(this.state.timerInterval),
            plogStart: null,
            plogTotalTime: 0,
            plogTimer: '00:00:00',
        });
    }

    tick = () => {
        let difference = (Date.now() - this.state.plogStart + this.state.plogTotalTime) / 1000;
        let hours   = Math.floor(difference / 3600);
        let minutes = Math.floor((difference - (hours * 3600)) / 60);
        let seconds = Math.floor(difference - (hours * 3600) - (minutes * 60));

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}

        this.setState({plogTimer: `${hours}:${minutes}:${seconds}`});
    }

    async componentDidMount() {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status === 'granted') {
            let location = await Location.getCurrentPositionAsync({});

            this.setState({ location });
        }

        /* const {loginWithGoogle} = require('../firebase/auth');
         * await loginWithGoogle(); */
    }

    componentWillUnmount() {
        this.setState({timerInterval: clearInterval(this.state.timerInterval)});
    }

    renderModeQuestions(mode=this.mode) {
        const {state} = this,
              activityName = Options.activities.get(state.activityType[0]).title,
              groupName = Options.groups.get(state.groupType[0]).title;

        switch (mode) {
        case 'Log':
            return (
                <>
                  <Question question="What were you up to?" answer={activityName}/>
                  <Selectable selection={state.activityType}>
                    {Array.from(Options.activities).map(([value, type]) => (
                        <Button title={type.title} value={value} icon={type.icon} key={value}
                                onPress={() => this.selectActivityType(value)} />
                    ))}
                  </Selectable>

                  <Question question="Who helped?" answer={groupName} />
                  <Selectable selection={state.groupType}>
                    {Array.from(Options.groups).map(([value, type]) => (
                        <Button title={type.title} value={value} icon={type.icon} key={value}
                                onPress={() => this.selectGroupType(value)} />
                    ))}
                  </Selectable>
                </>
            );
        }

        return null;
    }

    handleShareActivityPrefChange = (shareActivity) => {
        this.props.updatePreferences({ shareActivity })
      }

    render() {
        const {state} = this,
            typesCount = state.trashTypes.size,
            cleanedUp = typesCount > 1 ? `${typesCount} selected` :
            typesCount ? Options.trashTypes.get(state.trashTypes.first()).title : '',
            {params} = this.state;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Banner>
                <PlogScreenWeather />
            </Banner>

            <Text style={styles.timer}>
                <Text onPress={this.clearTimer} style={styles.clearButton}>clear</Text>
                <Text> </Text>
                {this.state.plogTimer}
            </Text>

            <MapView
                style={[styles.map]}
                initialRegion={{
                    latitude: 42.387,
                    longitude: -71.0995,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.04,
                }}
                followsUserLocation={true}
                showsUserLocation={true}
            />
            <View style={styles.timerButtonContainer} >
                <Button
                    title={this.state.timerInterval ? 'STOP TIMER' : 'START TIMER'}
                    onPress={this.toggleTimer}
                    style={styles.timerButton}
                    selected={!!this.state.timerInterval}
                />
            </View>

            <Question question="What did you clean up?" answer={cleanedUp}/>
            <Selectable selection={state.trashTypes} >
                {Array.from(Options.trashTypes).map(([value, type]) => (
                    <Button title={type.title} value={value} icon={type.icon} key={value}
                            onPress={() => this.toggleTrashType(value)}
                    />
                ))}
            </Selectable>

            <View style={styles.photoStrip}>
                {
                    this.state.plogPhotos.map((plogPhoto, idx) => (
                        <PlogPhoto onPictureSelected={picture => this.addPicture(picture, idx)}
                                   onCleared={_ => this.addPicture(null, idx)}
                                   plogPhoto={plogPhoto}
                                   key={idx}
                        />
                    ))
                }
            </View>

          {this.renderModeQuestions()}

            <Button title={PlogScreen.modes[this.state.selectedMode]}
                    primary
                    onPress={this.onSubmit}
                    style={$S.activeButton} />
            
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginLeft: 40,
                marginRight: 40,
            }}>
                <Text
                    style={{
                        color: '#5f646b',
                    }}
                >
                    Share in Local Feed
                </Text>
                <Switch
                    value={params.shareActivity}
                    style={{
                        borderRadius: 15,
                        borderColor: Colors.secondaryColor,
                        borderWidth: 2,
                        backgroundColor: '#4a8835',
                    }}
                />
            </View>

        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 30,
  },

    photoStrip: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-around'
    },

    map: {
        borderColor: Colors.borderColor,
        borderWidth: 1,
        flex: 1,
        height: 300,
        margin: 5
    },

    timerButton: {
        width: '30%',
        margin: 'auto',
        backgroundColor: 'white'
    },

    timerButtonContainer: {
        alignItems: 'center',
        top: '-10%'
    },

    timer: {
        textAlign: 'right',
        paddingRight: 5
    },

    clearButton: {
        color: 'grey',
        textDecorationLine: 'underline'
    }

});

const PlogScreenContainer = connect(state => ({
    user: state.users.get("current")
}),
                                    (dispatch) => ({
                                        logPlog(plogInfo) {
                                            dispatch(actions.logPlog(plogInfo));
                                        }
                                    }))(PlogScreen)

export default PlogScreenContainer;
