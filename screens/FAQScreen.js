import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';


export default class FAQScreen extends React.Component {
    static navigationOptions = {
        title: 'Frequently Asked Questions'
    };

    render() {
        return (
            <Text>
              More information about this app
            </Text>
        );
    }
}


const styles = StyleSheet.create({
});
