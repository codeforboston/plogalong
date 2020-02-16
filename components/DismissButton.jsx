import * as React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';


const DismissButton = ({style, ...props}) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity onPressOut={() => navigation.pop()} {...props}>
          <Text style={[styles.dismissButton, style]}>⊗</Text>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    dismissButton: {
        fontSize: 36,
        fontWeight: "200",
        paddingTop: 20,
        textAlign: 'right',
    }
});


export default DismissButton;
