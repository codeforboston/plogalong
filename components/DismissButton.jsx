import * as React from 'react';
import {
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const DismissButton = ({color = 'black', title, style, onDismiss, onPress, ...props}) => {
  const navigation = useNavigation();

  if (!onPress)
    onPress = (...args) => {
      if (onDismiss) onDismiss(...args);

      navigation.goBack();
    };

  return (
    <TouchableOpacity onPress={onPress}
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
