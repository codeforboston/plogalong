import * as React from 'react';
import {
  Platform,
  StyleSheet,
} from 'react-native';
import SegmentedControlTab from 'react-native-segmented-control-tab';

import Colors from '../constants/Colors';

const SegmentedControl = ({ onChange, values, selectedIndex }) => (
  <SegmentedControlTab
    tabsContainerStyle={styles.segmentedControl}
    selectedIndex={selectedIndex}
    values={values}
    onTabPress={onChange}
    tabTextStyle={styles.tabText}
    tabStyle={styles.tab}
    activeTabStyle={styles.activeTab}
  />
);

const styles = StyleSheet.create({
  segmentedControl: {
    margin: 10,
    ...Platform.select({
      ios: {
      }
    })
  },
  tab: {
    borderColor: Colors.secondaryColor,
  },
  tabText: {
    color: Colors.secondaryColor,
  },
  activeTab: {
    backgroundColor: Colors.selectionColor,
    borderColor: Colors.selectionColor,
  },
});

export default SegmentedControl;
