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
        <Text style={styles.right}>{answer}</Text>
    </View>
);

const styles = StyleSheet.create({
    question: {
        flex: 1,
        justifyContent: 'space-between',
     //   flexDirection: 'row',
        flexDirection: 'column',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        margin: 5,
        padding: 5,
    },
    left: {
        fontWeight: 'bold'
    },
    right: {
        color: Colors.textGray,
        fontSize: 18,
    }
});

export default Question;
