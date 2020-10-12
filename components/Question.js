import * as React from 'react';

import {
    Text,
    View,
    StyleSheet
} from 'react-native';
import Colors from '../constants/Colors';


const Question = ({question, answer}) => (
    <View style={styles.question}>
        <Text style={styles.left}>{question}</Text>
    </View>
);

const styles = StyleSheet.create({
    question: {
        margin: 5,
        padding: 5,
    },
    left: {
        color: Colors.activeColor,
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default Question;
