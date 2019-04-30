import React from 'react';
import {
    Alert,
    Image,
    StyleSheet,
} from 'react-native';

import {
    ImagePicker,
} from 'expo';

import { withNavigation } from 'react-navigation';

import Button from './Button';

import Colors from '../constants/Colors';

import CameraSrc from '../assets/images/camera.png';


class PlogPhoto extends React.Component {
    chooseImageSource = () => {
        Alert.alert('title', 'body', [
            {text: 'Camera', onPress: this.takeAndSelectPhoto},
            {text: 'Photo Roll', onPress: this.pickImage},
        ]);
    }

    takeAndSelectPhoto = async () => {
        try {
            const result = await this.takePhoto();

            if (this.props.onPictureSelected)
                this.props.onPictureSelected(result);
        } catch (_) {
            //
        }
    }

    takePhoto = () => {
        return new Promise((resolve, reject) => {
            this.props.navigation.navigate('Camera', {
                gotPhoto: resolve,
                cancel: reject
            });
        })
    }

    pickImage = async () => {
        const {onPictureSelected} = this.props;
        const result = await ImagePicker.launchImageLibraryAsync({});

        if (result.canceled) {
        } else {
            onPictureSelected && onPictureSelected(result);
        }
    }

    render() {
        const {plogPhoto, ...props} = this.props,
              source = plogPhoto ? {uri: plogPhoto.uri} : CameraSrc;

        return <Button title="Add Image"
                       icon={<Image source={source} style={{flex: 1}}/>}
                       onPress={this.chooseImageSource}
               />;
    }
}


const styles = StyleSheet.create({
    plogPhoto: {
        borderColor: Colors.secondaryColor,
        borderWidth: 2,
        height: 50,
        width: 50,
        marginLeft: 5,
        marginRight: 5,
    }
});

export default withNavigation(PlogPhoto);
