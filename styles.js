import {
    StyleSheet,
} from 'react-native';

import Colors from './constants/Colors';

export default StyleSheet.create({
  safeContainer: {
    backgroundColor: 'white',
    flex: 1
  },
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
      borderRadius: 8,
      fontSize: 18,
      marginLeft: 40,
      marginRight: 40,
      marginTop: 20,
      paddingTop: 10,
      paddingBottom: 10,
    },

    primaryButton: {
      backgroundColor: Colors.secondaryColor,
      color: 'white',
      marginLeft: 40,
      marginRight: 40,
      marginTop: 20,
      paddingTop: 10,
      paddingBottom: 10,
    },

    linkButton: {
      borderRadius: 5,
      borderColor: Colors.secondaryColor,
      borderWidth: 2,
      overflow: 'hidden',
      backgroundColor: Colors.secondaryColor,
      marginTop: 20,
      marginBottom: 5,
      marginLeft: 40,
      marginRight: 40,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 5,
      paddingRight: 5,
    },

    linkButtonText: {
      color: 'white',
      textAlign: 'center',
      fontSize: 18,
      textDecorationLine: 'none',
    },

    textButton: {
        textAlign: 'center'
    },

    activeButton: {
        backgroundColor: '#4a8835',
    },

    link: {
        color: Colors.secondaryColor,
        textDecorationLine: 'underline',
    },

    helpLink: {
        textDecorationStyle: 'dotted',
        textDecorationColor: 'black',
    },

  headline: {
    color: Colors.secondaryColor,
    fontSize: 30,
    fontWeight: '600',
  },

  subheader: {
    fontSize: 25,
    margin: 5,
    color: Colors.textGray
  },

  itemTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.selectionColor
  },

  modalContainer: {
    backgroundColor: Colors.selectionColor,
    flex: 1,
  },

  modalContent: {
    backgroundColor: '#fff',
    marginTop: 50,
    padding: 20,
    paddingBottom: 50,
    marginLeft: 20,
    marginRight: 20,
    minHeight: 400,
    borderRadius: 10,
  },

  modalButtonsContainer: {
    margin: 35,
    marginTop: 25,
  },

  modalButton: {
    color: Colors.activeGray,
    backgroundColor: 'white',
    borderWidth: 0,
  },

  detail: {},

  bodyContainer: {
    marginHorizontal: 10,
    marginTop: 10,
    
    alignContent: "center",
    alignItems: "flex-start",
  },

  body: {
    fontSize: 18,
    marginBottom: 15,
  },
  h1: {
    fontSize: 25,
    marginTop: 10,
    marginHorizontal: 10,
    color: Colors.textGray,
  },

  h2: {
    marginLeft: 20,
    marginRight: 20,
    padding: 5,
    textAlign: 'center',
  },
});
