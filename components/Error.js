import React from 'react';
import {
    StyleSheet,
    Text,
} from 'react-native';

import Colors from '../constants/Colors';

const Error = ({error}) => (
    <Text style={styles.errorContainer}>
      {error.message}
    </Text>
);

const styles = StyleSheet.create({
    errorContainer: {
        backgroundColor: Colors.errorBackground,
        color: Colors.errorText,
        padding: 10,
    }
});

export default Error;
