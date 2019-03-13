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
  static navigationOptions = {
      headerStyle: {
          backgroundColor: '#fff',
          borderBottomColor: 'purple',
          borderBottomWidth: 4
      },
      headerTitle: (<Header text="Plog" icon={require('../assets/images/plog.png')}/>)
  };

    static selectedModes = ['Log', 'Flag'];

    constructor(props) {
        super(props);
        this.state = {
            selectedMode: 0
        };
    }

    changeMode(idx) {
        this.setState({ selectedMode: idx });
    }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
             <Banner></Banner>

            <SegmentedControl selectedIndex={0}
                              values={PlogScreen.selectedModes}
                              onChange={(e) => this.changeMode(e.index) }
            />

            <Map/>
        </ScrollView>

        <View style={styles.tabBarInfoContainer}>
          <Text style={styles.tabBarInfoText}>This is a tab bar. You can edit it in:</Text>

          <View style={[styles.codeHighlightContainer, styles.navigationFilename]}>
            <MonoText style={styles.codeHighlightText}>navigation/MainTabNavigator.js</MonoText>
          </View>
        </View>
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
