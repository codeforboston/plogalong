import React from 'react';
import {
    StyleSheet,
} from 'react-native';
import MapView from 'react-native-maps';

import Colors from '../constants/Colors';


// See: https://github.com/react-native-community/react-native-maps
export default class Map extends React.Component {
    render() {
        return (
            <MapView
                style={[styles.map, this.props.style]}
                initialRegion={{
                    latitude: 42.387,
                    longitude: -71.0995,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.04,
                }}
            />
        );
    }
}

const styles = StyleSheet.create({
    map: {
        borderColor: Colors.borderColor,
        borderWidth: 1,
        flex: 1,
        height: 300,
        margin: 5
    }
});
