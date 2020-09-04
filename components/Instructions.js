import * as React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Button from './Button';
import Colors from '../constants/Colors';

const Instructions = ({ heading, singleImage, logo, instructionText, buttonText, linkText, onButtonPress }) => {

    return (
        <ScrollView style={styles.container}>
            <View style={styles.instructionsContainer}>
                <Text style={styles.headingText} maxFontSizeMultiplier={2}>{heading}</Text>
                {logo &&
                <Image source={logo} style={styles.logo}></Image>
                }
                {singleImage &&
                <Image source={singleImage} style={styles.singleImage}></Image>
                }
                <Text style={styles.instructionText} maxFontSizeMultiplier={2.5}>
                    {instructionText}
                </Text>
            </View>
            <Button style={styles.buttonStyle} title={buttonText} onPress={onButtonPress}/>
        </ScrollView>
    );
};

export default Instructions;


const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.selectionColor,
        flex: 1,
    },
    instructionsContainer: {
      backgroundColor: '#fff',
      marginTop: 50,
      padding: 20,
      marginLeft: 20,
      marginRight: 20,
      minHeight: 400,
      borderRadius: 10,
    },
    headingText: {
        alignSelf: 'center',
        fontFamily: 'Lato-Bold',
        fontWeight: 'bold',
        color: Colors.selectionColor,
        fontSize: 22,
    },
    instructionText: {
        textAlign: 'center',
        color: Colors.textGray,
        fontFamily: 'Lato',
        margin: 10,
        fontSize: 18,
        lineHeight: 25
    },
    logo: {
        alignSelf: 'center',
        marginBottom: 15,
    },
    buttonStyle: {
        backgroundColor: '#fff',
        color: Colors.textGray,
        width: 150,
        height: 55,
        marginTop: 30,
        lineHeight: 38,
        textAlignVertical: 'center',
        alignSelf: 'center',
        fontFamily: 'Lato',
        fontSize: 18,
        borderRadius: 5,
        borderColor: '#fff', 
        overflow: 'hidden',
    },
    singleImage: {
        alignSelf: 'center',
        marginBottom: 15,
        marginTop: 15,
        height: 226,
        width: 307,
        borderRadius: 5,
        borderColor: Colors.textGray,
        borderWidth: 3,
    }
  
});
