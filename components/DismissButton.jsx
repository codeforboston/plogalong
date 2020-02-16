import * as React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import { withNavigation } from 'react-navigation';


const DismissButton = ({navigation, style, ...props}) => (
    <TouchableOpacity onPressOut={() => navigation.pop()} {...props}>
      <Text style={[styles.dismissButton, style]}>⊗</Text>
    </TouchableOpacity>
);


const styles = StyleSheet.create({
    dismissButton: {
        fontSize: 36,
        fontWeight: "200",
        paddingTop: 20,
        textAlign: 'right',
    }
});


export default withNavigation(DismissButton);
