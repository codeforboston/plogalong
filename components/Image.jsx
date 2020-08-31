import * as React from 'react';
import {
  Image
} from 'react-native';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';


/**
 * @param {string} uri
 * @returns {Promise<string>}
 */
async function mangleURI(uri) {
  if (!uri.match(/^https?:\/\//))
    return uri;

  const filename = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA1, uri);
  return `${FileSystem.cacheDirectory}${filename}`;
}

const useSource = (source, makeLocalURI=mangleURI) => {
  const [cachedSource, setCachedSource] = React.useState(null);
  const downloading = React.useRef();

  React.useEffect(() => {
    (async () => {
      downloading.current = source && source.uri;
      if (source && source.uri) {
        if (source.uri.match(/^https?:\/\//)) {
          const localURI = await makeLocalURI(source.uri);
          const info = await FileSystem.getInfoAsync(localURI);

          if (!info.exists) {
            console.log('downloading', source.uri, '->', localURI);
            await FileSystem.downloadAsync(
              source.uri, localURI,
              Object.assign({}, source.headers && { headers: source.headers }));
          } else {
            console.log('reading cached image from file', localURI);
          }

          if (source.uri === downloading.current) {
            setCachedSource(Object.assign({}, source, { uri: localURI }));
          }
          return;
        }
      }
      setCachedSource(source);
    })();
  }, [source]);

  return cachedSource;
};


/** @typedef {React.ComponentProps<typeof Image>} ImageProps */
/** @type {React.ForwardRefExoticComponent<ImageProps>} */
const CachingImage = React.memo(React.forwardRef(({ source, ...props}, ref) => {
  const cachedSource = useSource(source);

  return (
    <Image ref={ref} source={cachedSource} {...props} />
  );
}));

export default CachingImage;
