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
import Header from '../components/Header';
import Map from '../components/Map';
import SegmentedControl from '../components/SegmentedControl';
import { MonoText } from '../components/StyledText';

export default class PlogScreen extends React.Component {
    static modes = ['Log', 'Flag'];

    constructor(props) {
        super(props);
        this.state = {
            selectedMode: 0
        };
    }

    changeMode = (idx) => {
        console.log('changed selection:', idx);
        this.setState({ selectedMode: idx });
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
});
