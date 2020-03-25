import * as React from 'react';
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
        margin: 10,
        marginBottom: 20,
    }
});

export default Error;
