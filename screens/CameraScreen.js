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
    }

    takePhoto = async () => {
        const {navigation} = this.props;

        /* navigation.addListener('onDidBlur', () => {
         *     if (didNotTakePhoto)
         *         navigation.getParam('cancel')();
         * }) */

        if (this.state.hasPermissions) {
            const gotPhoto = navigation.getParam('gotPhoto');
            gotPhoto(await this.camera.takePictureAsync());
            navigation.pop();
        }
    }

    render() {
        if (!this.state.hasPermissions) {
            return (
                <Text>Gimme permission</Text>
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

    }
});
