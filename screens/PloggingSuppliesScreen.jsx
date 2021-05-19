import * as React from 'react';
import {
  AppState,
  Linking
} from 'react-native';
import { WebView } from 'react-native-webview';
import config from '../config';

import $S from '../styles';


const PloggingSuppliesScreen = () => {
  const webView = React.useRef(/** @type {WebView} */ (null));

  return (
    <WebView
      ref={r => { webView.current = r; }}
      originWhitelist={['*']}
      onNavigationStateChange={({url, navigationType}) => {
        if (navigationType !== 'click' ||
            AppState.currentState !== 'active' ||
            !(url && url.match(/amazon\.com/)))
          return;

        Linking.openURL(url);
        webView.current.stopLoading();
      }}
      source={{ html: config.amazonAffiliateSource,
                baseUrl: `http://${config.appDomain}` }}
      style={[$S.container, { paddingTop: 20 }]}
    />
  );
};

export default PloggingSuppliesScreen;
