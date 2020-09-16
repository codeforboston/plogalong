import * as React from 'react';

import {
    Text,
    View,
    StyleSheet
} from 'react-native';
import Colors from '../constants/Colors';


const Answer = ({answer}) => (
    <View style={styles.answer}>
        <Text>{answer}</Text>
    </View>
);

const styles = StyleSheet.create({
    answer: {
        margin: 5,
        padding: 5,
    },
});

export default Answer;
