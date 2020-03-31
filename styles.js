import {
    StyleSheet,
} from 'react-native';

import Colors from './constants/Colors';


export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20
    },

    screenContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },

    scrollContentContainer: {
        paddingTop: 20,
    },

    form: {
        flexDirection: 'column'
    },

    inputGroup: {
        marginBottom: 10,
        paddingTop: 20,
    },

    textInput: {
        borderColor: Colors.borderColor,
        borderWidth: 1,
        fontSize: 18,
        padding: 10,
    },

    inputLabel: {
        marginBottom: 10,
        fontWeight: '500',
    },

    switchInputGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 5,
    },

    switch: {},

    button: {
        borderRadius: 5,
        borderColor: Colors.secondaryColor,
        borderWidth: 2,
        margin: 5,
        overflow: 'hidden',
        padding: 5,
    },

    largeButton: {
        marginLeft: 40,
        marginRight: 40,
        marginTop: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },

    primaryButton: {
        backgroundColor: Colors.secondaryColor,
        color: 'white',
    },

    textButton: {
        textAlign: 'center'
    },

    activeButton: {
        backgroundColor: '#4a8835',
    },

    link: {
        color: Colors.tintColor,
        textDecorationLine: 'underline',
    },

    helpLink: {
        textDecorationStyle: 'dotted',
        textDecorationColor: 'black',
    }
});
