import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { MapView, Constants, Location, Permissions } from 'expo';
import { Marker } from 'react-native-maps';

import { Set } from 'immutable';

import Banner from '../components/Banner';
import Button from '../components/Button';
import PlogPhoto from '../components/PlogPhoto';
import Question from '../components/Question';
import SegmentedControl from '../components/SegmentedControl';
import Selectable from '../components/Selectable';

import Options from '../constants/Options';
import Colors from '../constants/Colors';

import {connect} from 'react-redux';
import * as actions from '../redux/actions';


class PlogScreen extends React.Component {
    static modes = ['Log', 'Flag'];

    constructor(props) {
        super(props);
        this.state = {
            selectedMode: 0,
            trashTypes: Set([]),
            activityType: ['walking'],
            groupType: ['alone'],
            plogPhotos: [null, null, null, null, null]
        };
    }

    changeMode = (idx) => {
        this.setState({ selectedMode: idx });
    }

    get mode() {
        return PlogScreen.modes[this.state.selectedMode];
    }

    onSubmit = () => {
        const {latitude, longitude} = this.state.location.coords;
        const plog = {
            location: {lat: latitude, lng: longitude, name: 'beach'},
            when: new Date(),
            pickedUp: this.mode === 'Log',
            trashTypes: this.state.trashTypes,
            activityType: this.state.activityType[0],
            groupType: this.state.groupType[0],
            plogPhotos: this.state.plogPhotos.filter(p=> p!=null)
        };
        this.props.logPlog(plog);
        Alert.alert('Achievement Unlocked!', 'Break the seal: first plogger in the neighborhood', [{text: 'OK!'}]);
        this.setState({
            trashTypes: Set([]),
            selectedMode: 0,
            plogPhotos: [null, null, null, null, null]
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
        console.log('selectGroupType', group);
        this.setState(state => ({
            groupType: [group]
        }));
    }

    async componentDidMount() {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status === 'granted') {
            let location = await Location.getCurrentPositionAsync({});

            this.setState({ location });
        }
    }

    renderModeQuestions(mode=this.mode) {
        const {state} = this,
              activityName = Options.activities.get(state.activityType[0]).title;

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

                  <Question question="Who helped?" answer="I was alone" />
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
            typesCount ? Options.trashTypes.get(state.trashTypes.first()).title : '';

    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Banner>
                Hello, world!
            </Banner>

            <SegmentedControl selectedIndex={state.selectedMode}
                              values={PlogScreen.modes}
                              onChange={this.changeMode}
            />

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
                    onPress={this.onSubmit}
                    style={styles.activeButton} />

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
    activeButton: {
        backgroundColor: Colors.secondaryColor,
        color: 'white',
        marginLeft: 40,
        marginRight: 40,
        paddingTop: 10,
        paddingBottom: 10,
        overflow: 'hidden',
    },
    map: {
        borderColor: Colors.borderColor,
        borderWidth: 1,
        flex: 1,
        height: 300,
        margin: 5
    },

});

const PlogScreenContainer = connect(null,
                                    (dispatch) => ({
                                        logPlog(plogInfo) {
                                            dispatch(actions.logPlog(plogInfo));
                                        }
                                    }))(PlogScreen)

export default PlogScreenContainer;
