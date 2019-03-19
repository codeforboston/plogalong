import React from 'react';
import {
    Platform,
    SegmentedControlIOS,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Colors from '../constants/Colors';

let SegmentedControl;

console.log(Platform.OS);
if (Platform.OS === 'ios') {
    SegmentedControl = ({onChange, ...props}) => (
        <SegmentedControlIOS {...props}
                             onChange={(e) => {
                                 if (onChange)
                                     onChange(e.nativeEvent.selectedSegmentIndex);
                             }}
                             tintColor={Colors.selectionColor}
                             style={styles.segmentedControl}
        />
    );
} else {
    /* TODO Android implementation */
    SegmentedControl = class extends React.Component {
        render() {
            return (
                <View style={styles.segmentedControl}>

                </View>
            );
        }
    }
}


export default SegmentedControl;

const styles = StyleSheet.create({
    segmentedControl: {
        margin: 10,
        ...Platform.select({
            ios: {
            }
        })
    }
});
