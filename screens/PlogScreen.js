import React from 'react';
import {
    Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MapView, Constants, Location, Permissions } from 'expo';
import { Marker } from 'react-native-maps';

import { Set } from 'immutable';

import Banner from '../components/Banner';
import Button from '../components/Button';
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
            groupType: ['alone']
        };
    }

    changeMode = (idx) => {
        this.setState({ selectedMode: idx });
    }

    logPlog = () => {
        const plog = {
            location: {},
            when: new Date(),
            trashTypes: this.state.trashTypes,
            activityType: this.state.activityType[0],
            groupType: this.state.groupType[0]
        };
        this.props.logPlog(plog);
        Alert.alert('Achievement Unlocked!', 'Break the seal: first plogger in the neighborhood', [{text: 'OK!'}]);
        this.setState({
            trashTypes: Set([]),
            activityType: ['walking'],
            groupType: ['alone']
        });
    }

    toggleTrashType = (trashType) => {
        this.setState(({trashTypes}) => ({
            trashTypes: trashTypes.has(trashType) ? trashTypes.delete(trashType) : trashTypes.add(trashType)
        }));
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
            console.log(location);
        }
    }

  render() {
      const {state} = this,
            typesCount = state.trashTypes.size,
            cleanedUp = typesCount > 1 ? `${typesCount} selected` :
                                     typesCount ? Options.trashTypes.get(state.trashTypes.first()).title : '',
            activityName = Options.activities.get(state.activityType[0]).title;

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

            <Button title="Log" onPress={this.logPlog} style={styles.activeButton} />

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
        flexDirection: 'row',
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
