import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebBrowser } from 'expo';

import Banner from '../components/Banner';
import Button from '../components/Button';
import Header from '../components/Header';
import Map from '../components/Map';
import SegmentedControl from '../components/SegmentedControl';
import Selectable from '../components/Selectable';
import { MonoText } from '../components/StyledText';

import Options from '../constants/Options';

import {connect} from 'react-redux';
import * as actions from '../redux/actions';

const {trashTypes, activities} = Options;


class PlogScreen extends React.Component {
    static modes = ['Log', 'Flag'];

    constructor(props) {
        super(props);
        this.state = {
            selectedMode: 0,
            selection: ['trash']
        };
    }

    changeMode = (idx) => {
        console.log('changed selection:', idx);
        this.setState({ selectedMode: idx });
    }

    logPlog = () => {
        const plog = {
            location: {},
            when: new Date(),
            trashTypes: this.state.selection,
            activity: 'swimming/biking',
            groupType: 'dog'
        };
        console.log('Plogged:', plog);
        this.props.logPlog(plog);
    }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Banner>
                Hello, world!
            </Banner>

            <SegmentedControl selectedIndex={this.state.selectedMode}
                              values={PlogScreen.modes}
                              onChange={this.changeMode}
            />

            <Map/>

            <Selectable selection={this.state.selection}>
                {trashTypes.map(type => (
                    <Button title={type.title} value={type.value} icon={type.icon} key={type.value} />
                ))}
            </Selectable>

            <Selectable selection={this.state.selection}>
                {activities.map(type => (
                    <Button title={type.title} value={type.title} icon={type.icon} key={type.title} />
                ))}
            </Selectable>

            <Button title="Log" onPress={this.logPlog} />

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
    }
});

const PlogScreenContainer = connect(null,
                                    (dispatch) => ({
                                        logPlog(plogInfo) {
                                            dispatch(actions.logPlog(plogInfo));
                                        }
                                    }))(PlogScreen)

export default PlogScreenContainer;
