import React from 'react';
import {
  AsyncStorage,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';

import { Provider } from 'react-redux';
import './fixtimerbug';
import makeStore from "./redux/store";

import AppNavigator from './navigation/AppNavigator';
import FlashMessage from './FlashMessage';


export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    preferences: {}
  };

  async loadPreferences() {
    // Reset preferences (for testing)
    // await AsyncStorage.setItem('com.plogalong.preferences', '{}');
    const prefs = await AsyncStorage.getItem('com.plogalong.preferences');

    this.setState({ preferences: prefs ? JSON.parse(prefs) : {}});
  }

  render() {
    const {preferences} = this.state;

    if (!this.state.isLoadingComplete || !preferences) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <Provider store={makeStore(preferences)}>
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            <AppNavigator />
            <FlashMessage />
          </View>
        </Provider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Font.loadAsync({
        'Lato': require('./assets/fonts/Lato-Regular.ttf'),
        'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
      }),
      this.loadPreferences()
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
