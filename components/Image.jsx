import * as React from 'react';
import {
  Image,
  Text,
} from 'react-native';
import * as RN from 'react-native';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';

import { keepKeys } from '../util/iter';


/** @typedef {RN.ImageURISource} ImageURISource */

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

const prefix = pref => (s => s.startsWith(pref) ? s.slice(pref.length) : false);

/** @typedef {{ [k in string]: string }} FileMetadata */
/**
 * @param {RN.ImageURISource} source
 * @param {(uri: string) => Promise<string>} mangleLocalURI
 *
 * @returns {[RN.ImageURISource, FileMetadata]}
 */
export const useSource = (source, makeLocalURI=mangleURI, includeMetadata=true) => {
  const [cachedSource, setCachedSource] = React.useState([null, {}]);
  const downloading = React.useRef();

  React.useEffect(() => {
    (async () => {
      downloading.current = source && source.uri;
      if (source && source.uri) {
        if (source.uri.match(/^https?:\/\//)) {
          const localURI = await makeLocalURI(source.uri);
          const metadataURI = `${localURI}.json`;
          const info = await FileSystem.getInfoAsync(localURI);
          const metadata = {};

          if (!info.exists) {
            const { headers } = await FileSystem.downloadAsync(
              source.uri, localURI,
              Object.assign({}, source.headers && { headers: source.headers }));
            if (includeMetadata) {
              Object.assign(metadata, keepKeys(headers, prefix('x-goog-meta-')));
              FileSystem.writeAsStringAsync(metadataURI, JSON.stringify(metadata)).catch(console.error);
            }
          } else if (includeMetadata) {
            const loadedMetadata = await FileSystem.readAsStringAsync(metadataURI).then(JSON.parse, _ => ({}));
            Object.assign(metadata, loadedMetadata);
          }

          if (source.uri === downloading.current) {
            setCachedSource([
              Object.assign({}, source, { uri: localURI }),
              metadata
            ]);
          }
          return;
        }
      }
      setCachedSource([source, {}]);
    })();
  }, [source]);

  return cachedSource;
};


/** @typedef {React.ComponentProps<typeof Image>} ImageProps */
/** @type {React.ForwardRefExoticComponent<ImageProps>} */
const CachingImage = React.memo(React.forwardRef(({ source, ...props}, ref) => {
  const [cachedSource, metadata] = useSource(source);

  if (metadata['marked-safe'] === '0') {
    return (
      <Text style={[props.style, { backgroundColor: '#ccc', textAlign: 'center', textAlignVertical: 'center' }]}>
      </Text>
    )
  }

  return (
    <Image ref={ref} source={cachedSource} {...props} />
  );
}));


export default CachingImage;
