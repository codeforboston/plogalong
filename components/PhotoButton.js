import React from 'react';
import {
    Alert,
    Image,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';

import icons from '../icons';

import Button from './Button';


class PhotoButton extends React.Component {
    chooseImageSource = () => {
        const extraOptions = this.props.photo ?
              [{text: 'Clear', onPress: this.clearPhoto}] : [];

        Alert.alert('Pick a photo', '', [
            {text: 'Camera', onPress: this.takeAndSelectPhoto},
            {text: 'Photo Roll', onPress: this.pickImage},
            ...extraOptions,
            {text: 'Cancel', style: 'cancel'}
        ]);
    }

    clearPhoto = () => {
        if (this.props.onCleared)
            this.props.onCleared();
    }

    takeAndSelectPhoto = async () => {
        const {onPictureSelected} = this.props;
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true
        });

        if (!result.cancelled) {
            onPictureSelected && onPictureSelected(result);
        }
    }

    pickImage = async () => {
        const {onPictureSelected} = this.props;
        const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if (status !== 'granted') {
            Alert.alert('Permission Required', 'We need access to your camera roll for that option.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true
        });

        if (!result.cancelled) {
            onPictureSelected && onPictureSelected(result);
        }
    }

    render() {
        const {photo, style, imageStyle, defaultIcon: DefaultIcon=icons.Camera, ...props} = this.props,
              icon = photo ?
              <Image source={photo} style={[{flex: 1}, imageStyle]}/> :
              <DefaultIcon/>;

        return <Button title="Add Image"
                       icon={icon}
                       onPress={this.chooseImageSource}
                       style={style}
               />;
    }
}

export default props => {
    const navigation = useNavigation();

    return <PhotoButton navigation={navigation} {...props}/>;
};
