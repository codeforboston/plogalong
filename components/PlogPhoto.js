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

import icons from '../icons';

import Button from './Button';


class PlogPhoto extends React.Component {
    chooseImageSource = () => {
        const extraOptions = this.props.plogPhoto ?
              [{text: 'Clear', onPress: this.clearPhoto}] : [];

        Alert.alert('title', 'body', [
            {text: 'Camera', onPress: this.takeAndSelectPhoto},
            {text: 'Photo Roll', onPress: this.pickImage},
            ...extraOptions
        ]);
    }

    clearPhoto = () => {
        if (this.props.onCleared)
            this.props.onCleared();
    }

    takeAndSelectPhoto = async () => {
        try {
            const result = await this.takePhoto();

            if (this.props.onPictureSelected)
                this.props.onPictureSelected(result);
        } catch (error) {console.log(error)}
    }

    takePhoto = () => {
      return new Promise((resolve, reject) => {
          this.props.navigation.navigate('Camera', {
              gotPhoto: resolve,
              photoError: reject,
              takingPhoto: () => this.setState({ capturing: true }),
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
              icon = plogPhoto ? <Image source={{uri: plogPhoto.uri}} style={{flex: 1}}/> :
              <icons.Camera/>;

        return <Button title="Add Image"
                       icon={icon}
                       onPress={this.chooseImageSource}
               />;
    }
}


const styles = StyleSheet.create({
    plogPhoto: {}
});

export default withNavigation(PlogPhoto);
