import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback
} from 'react-native';

import { ImagePicker } from 'expo';

import Button from './Button';

import Colors from '../constants/Colors';

import CameraSrc from '../assets/images/camera.png';


export default class PlogPhoto extends React.Component {
    _pickImage = async () => {
        const {onPictureSelected} = this.props;
        const result = await ImagePicker.launchImageLibraryAsync({});

        if (result.canceled) {
            onPictureSelected && onPictureSelected(result);
        } else {

        }
    }

    render() {
        const {plogPhoto, ...props} = this.props,
              source = plogPhoto ? {uri: plogPhoto.uri} : CameraSrc;
        

        return <Button title="Add Image"
                       icon={<Image source={source} style={{flex: 1}}/>}
                       onPress={this._pickImage}
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
