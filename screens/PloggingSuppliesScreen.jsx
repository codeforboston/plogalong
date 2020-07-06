import * as React from 'react';
import { WebView } from 'react-native-webview';
import config from '../config';

import $S from '../styles';


const PloggingSuppliesScreen = () => (
    <WebView
      originWhitelist={['*']}
      source={{ html: config.amazonAffiliateSource, baseUrl: 'https://app.plogalong.com' }}
      style={[$S.container, { paddingTop: 20 }]}
    />
);

export default PloggingSuppliesScreen;
