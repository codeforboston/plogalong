import * as React from 'react';
import {
    Alert,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as ImageManipulator from 'expo-image-manipulator';

import icons from '../icons';

import Button from './Button';

/** @typedef {React.ComponentProps<typeof Image>} ImageProps */
/** @typedef {React.ComponentProps<typeof Button>} ButtonProps */
/**
 * @typedef {object} PhotoButtonProps
 * @property {ImageProps["source"]} [photo]
 * @property {React.ReactNode} [defaultIcon]
 * @property {(result: ImagePicker.ImagePickerResult) => void} [onPictureSelected] Called with information about the selected image. If `manipulatorActions` are provided, called again after the actions have run
 * @property {() => void} [onCleared]
 * @property {ImageProps["style"]} [imageStyle]
 * @property {ButtonProps["style"]} [style]
 * @property {ImageManipulator.Action[]} [manipulatorActions] Apply manipulations to the selected image
 */

/** @extends {React.Component<PhotoButtonProps>} */
class PhotoButton extends React.Component {
    chooseImageSource = () => {
        const extraOptions = (this.props.photo && this.props.onCleared) ?
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
      const {onPictureSelected, manipulatorActions} = this.props;
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

          if (manipulatorActions) {
            const updatedImage = await ImageManipulator.manipulateAsync(result.uri, manipulatorActions);
            onPictureSelected && onPictureSelected(updatedImage);
          }
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


export default /** @type {React.FunctionComponent<PhotoButtonProps>}/> */(props => {
    const navigation = useNavigation();

    return <PhotoButton navigation={navigation} {...props}/>;
});
