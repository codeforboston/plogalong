import React from 'react';
import {
    Platform,
    StyleSheet,
} from 'react-native';
import SegmentedControlTab from 'react-native-segmented-control-tab';

import Colors from '../constants/Colors';

export default SegmentedControl = ({ onChange, values, selectedIndex }) => (
    <SegmentedControlTab
        tabsContainerStyle={styles.segmentedControl}
        selectedIndex={selectedIndex}
        values={values}
        onTabPress={onChange}
        tabTextStyle={{
            color: Colors.secondaryColor,
        }}
        tabStyle={{
            borderColor: Colors.secondaryColor,
        }}
        activeTabStyle={{
            backgroundColor: Colors.selectionColor,
            borderColor: Colors.selectionColor,
        }}
    />
);


const styles = StyleSheet.create({
    segmentedControl: {
        margin: 10,
        ...Platform.select({
            ios: {
            }
        })
    }
});
