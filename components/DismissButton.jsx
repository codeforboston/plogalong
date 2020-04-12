import * as React from 'react';
import {
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const DismissButton = ({color = 'black', title, style, onPress, ...props}) => {
    const navigation = useNavigation();

    const onPressOut = (...args) => {
      if (onPress) onPress(...args);

      navigation.pop();
    };

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

export default DismissButton;
