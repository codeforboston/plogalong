import * as React from 'react';
import {
    StyleSheet,
    View,
    Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import config from '../config';

import $S from '../styles';


const PloggingSuppliesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={$S.h1}>
        Plogging Supplies
      </Text>
      <WebView
        originWhitelist={['*']}
        source={{ html: config.amazonAffiliateSource, baseUrl: 'https://app.plogalong.com' }}
        style={{ marginTop: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

export default PloggingSuppliesScreen;
