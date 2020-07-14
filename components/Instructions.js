import * as React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from './Button';
import Colors from '../constants/Colors';

const Instructions = ({ heading, images, singleImage, placeholderBadge, iconList, iconList2, instructionText, paragraphs, buttonText, linkText, onButtonPress }) => {
    let imagesThree, icons, moreIcons;

    if (images) {
        imagesThree = images.map((image, index) => {
            return <Image key={index} style={styles.staticPhotoThree} source={image}/>;
        });
    } 
    if (iconList) {
        icons = iconList.map((icon, index) => {
            return <Button key={index} style={styles.activity} icon={icon} />
        });
    }
    if (iconList2) {
        moreIcons = iconList2.map((icon, index) => {
            return <Button key={index} style={styles.activity} icon={icon} />
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.instructionsContainer}>
                <Text style={styles.headingText}>{heading}</Text>
                <View style={styles.photoStrip}>
                    {imagesThree}
                </View>
                <Image source={singleImage} style={styles.singleImage}></Image>
                <View style={styles.photoStrip}>
                    {icons}
                </View>
                <View style={styles.photoStrip}>
                    {moreIcons}
                </View>
                <Image source={placeholderBadge} style={styles.placeholderBadge}></Image>
                <Text style={styles.instructionText}>
                    {instructionText}
                </Text>
                <Text style={styles.paragraphs}>{paragraphs}</Text>
            </View>

            <Button style={styles.buttonStyle} title={buttonText} onPress={onButtonPress}/>
        </View>
    )};

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
      paddingBottom: 50,
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

    staticPhotoThree: {
        borderColor: Colors.selectionColor,
        borderWidth: 2,
        height: 90,
        width: 90,
        marginLeft: 5,
        marginRight: 5,
    },
  
    activity: {
        borderColor: Colors.selectionColor,
        borderWidth: 2,
        height: 50,
        width: 50,
        marginLeft: 5,
        marginRight: 5,
    },
    photoStrip: {
        flexDirection: 'row',
        marginTop: 15,
        justifyContent: 'space-around'
    },
    buttonStyle: {
        backgroundColor: '#fff',
        color: Colors.textGray,
        width: 150,
        height: 55,
        marginTop: 30,
        paddingTop: 13,
        alignSelf: 'center',
        fontFamily: 'Lato',
        fontSize: 18,
        borderRadius: 5,
        borderColor: '#fff', 
        overflow: 'hidden',
    },
    placeholderBadge: {
        alignSelf: 'center',
    }, 
    paragraphs: {
        color: Colors.textGray,
        fontFamily: 'Lato',
        margin: 18,
        marginTop: -50,
        marginBottom: 0,
        fontSize: 18,
        lineHeight: 25,
    },
    singleImage: {
        alignSelf: 'center',
        marginBottom: 0,
    }
  
});
