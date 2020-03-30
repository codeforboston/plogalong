import * as React from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback, Keyboard
} from 'react-native';
import ContactForm from '../components/ContactForm'
import $S from '../styles';

export default class ContactScreen extends React.Component{
    static navigationOptions = {
        title: 'Contact Us'
    };

    render(){
        return (
            <ScrollView style={[$S.screenContainer, ]}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.screenContainerStyles}>  
                        <ContactForm />
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    screenContainerStyles: {
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});