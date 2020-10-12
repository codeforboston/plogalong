import * as React from 'react';
import { useCallback } from 'react';
import {
  Text,
  View,
  Linking,
} from 'react-native';
import $S from '../styles';

const OpenURLButton = ({ url, children }) => {
  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, [url]);

  return (
    <View style={$S.linkButton}>
      <Text style={$S.linkButtonText} onPress={handlePress}>
      {children}
      </Text>
    </View>
  );
};

export default OpenURLButton;