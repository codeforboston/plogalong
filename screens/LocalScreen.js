import React from 'react';
import {
    StyleSheet,
    View
} from 'react-native';

import $S from '../styles';

export default class LocalScreen extends React.Component {
  render() {
    return (
        <View style={$S.container}>
          <View style={{ height: 25 }}></View>
        </View>
    );
  }
}

const styles = StyleSheet.create({});
