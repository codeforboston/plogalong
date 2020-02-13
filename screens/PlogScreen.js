import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    View,
    Text,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';

import { Set } from 'immutable';

import Banner from '../components/Banner';
import Button from '../components/Button';
import PhotoButton from '../components/PhotoButton';
import Question from '../components/Question';
import Selectable from '../components/Selectable';

import Options from '../constants/Options';
import Colors from '../constants/Colors';
import $S from '../styles';

import {connect} from 'react-redux';
import * as actions from '../redux/actions';
import {
    setUserData
} from '../firebase/auth';

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
        if (!this.props.user) {
            console.warn('Unauthenticated user; skipping plog');
            return;
        }

        const coords = this.props.location;
        const plog = {
            location: coords ? {lat: coords.latitude, lng: coords.longitude, name: 'beach'} : null,
            when: new Date(),
            pickedUp: this.mode === 'Log',
            trashTypes: this.state.trashTypes.toJS(),
            activityType: this.state.activityType[0],
            groupType: this.state.groupType[0],
            plogPhotos: this.state.plogPhotos.filter(p=> p!=null),
            timeSpent: this.state.plogTotalTime + (this.state.plogStart ? Date.now() - this.state.plogStart : 0),
            public: this.props.user.data.shareActivity,
        };
        this.props.logPlog(plog);
        // Alert.alert('Achievement Unlocked!', 'Break the seal: first plogger in the neighborhood', [{text: 'OK!'}]);
        this.setState({
            trashTypes: Set([]),
            selectedMode: 0,
            plogPhotos: [null, null, null, null, null],
            timerInterval: clearInterval(this.state.timerInterval),
            plogStart: null,
            plogTotalTime: 0,
            plogTimer: '00:00:00',
        });

        this.props.navigation.navigate('History');
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
            this.props.startWatchingLocation();
        }
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

    render() {
        const {state} = this,
            typesCount = state.trashTypes.size,
            cleanedUp = typesCount > 1 ? `${typesCount} selected` :
            typesCount ? Options.trashTypes.get(state.trashTypes.first()).title : '',
            {params} = this.state;

    return (
      <View style={$S.screenContainer}>
        <ScrollView style={$S.screenContainer} contentContainerStyle={$S.scrollContentContainer}>
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
                        <PhotoButton onPictureSelected={picture => this.addPicture(picture, idx)}
                                   onCleared={_ => this.addPicture(null, idx)}
                                   photo={plogPhoto}
                                   key={idx}
                        />
                    ))
                }
            </View>

          {this.renderModeQuestions()}

            <Button title={PlogScreen.modes[this.state.selectedMode]}
                    disabled={!this.props.user}
                    primary
                    onPress={this.onSubmit}
                    style={$S.activeButton} />
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
      </View>
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
    },

    shareInLocalFeed: {
        margin: 10,
        marginLeft: 40,
        marginRight: 40,
        marginBottom: 20,
    },
});

const PlogScreenContainer = connect(state => ({
    user: state.users.get("current").toJS(),
    location: state.users.get('location'),
}),
                                    (dispatch) => ({
                                        logPlog(plogInfo) {
                                            dispatch(actions.logPlog(plogInfo));
                                        },
                                        startWatchingLocation() {
                                            dispatch(actions.startWatchingLocation());
                                        }
                                    }))(PlogScreen);

export default PlogScreenContainer;
