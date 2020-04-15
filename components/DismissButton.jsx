import * as React from 'react';
import {
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux';
import * as actions from '../redux/actions';


const DismissButton = ({color = 'black', title, style, shouldClearError = false, ...props}) => {
    const navigation = useNavigation();

    const onPressOut = () => {
        if (shouldClearError) {
            props.clearSignupError()
        }

        navigation.pop()
    }

    return (
      <TouchableOpacity onPress={onPressOut}
                        accessibilityLabel={title || 'close'}
                        accessibilityRole="button"
                        {...props}>
          <Ionicons name="md-close" size={32} color={color} style={[styles.dismissButton, style]} />
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    dismissButton: {
        paddingTop: 20,
        textAlign: 'right',
    }
});

const ReduxDismissButton = connect(
    null,
    dispatch => ({
        clearSignupError: () => dispatch(actions.signupError()),
    })
)(DismissButton);

export default ReduxDismissButton;
