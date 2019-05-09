import React from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback
} from 'react-native';

import {
    Camera,
    ImagePicker,
    Permissions,
} from 'expo';

import Button from '../components/Button';


export default class CameraScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasPermissions: false };
    }

    async componentDidMount() {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasPermissions: status === 'granted'
        });

        this.props.navigation.addListener('didBlur', () => {
            if (!this.tookPhoto) {
                const onCancel = this.props.navigation.getParam('cancel')();
                if (onCancel) onCancel();
                this.tookPhoto = false;
            }
        });

    }

    takePhoto = () => {
        const {navigation} = this.props;

        if (this.state.hasPermissions) {
            const gotPhoto = navigation.getParam('gotPhoto'),
                  takingPhoto = navigation.getParam('takingPhoto'),
                  photoError = navigation.getParam('photoError');

            this.tookPhoto = true;

            this.camera.takePictureAsync().then(
                photo => {
                    if (gotPhoto) gotPhoto(photo);
                },
                error => {
                    if (photoError) photoError(error);

                    console.error('Error in takePictureAsync:', error);
                }
            );
            navigation.pop();
        }
    }

    render() {
        if (!this.state.hasPermissions) {
            return (
                <Text>
                  To use this feature, you'll need to grant this app permission to use the camera.
                </Text>
            );
        }

        return (
            <Camera ref={ref => { this.camera = ref; }}
                    style={styles.camera}
            >
              <Button onPress={this.takePhoto}
                      title="Take Photo"
                      style={styles.cameraButton} />
            </Camera>
        );
    }
}


const styles = StyleSheet.create({
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 20
    },
    cameraButton: {
        backgroundColor: 'white'
    }
});
