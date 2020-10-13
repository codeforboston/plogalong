import * as React from 'react';
import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

import $S from '../styles';

import DismissButton from '../components/DismissButton';
import Loading from '../components/Loading';


export const PopupHeader = ({title, image, details}) => (
  <View style={styles.popupHeader}>
    {
      image && React.cloneElement(image, { style: [styles.popupHeaderPicture, image.props.style] })
    }
    <View style={styles.popupHeaderDetails}>
      <Text style={styles.popupHeaderTitle} adjustsFontSizeToFit={true}>
        {title}
      </Text>
      <View style={{ flex: 1 }}/>
      <Text>{details}</Text>
    </View>
  </View>
);

/** @typedef {React.ComponentProps<typeof View>} ViewProps */
/**
 * @template {(params: any) => any} LoaderFn
 * @typedef {object} PopupDataViewProps
 * @property {LoaderFn} loader
 * @property {(object: ReturnType<typeof loader>) => React.ReactNode} children
 * @property {(e: Error) => string} errorTitle
 * @property {(e: Error) => string} errorDetails
 */

/**
 * @template {(params: any) => any} T
 * @type {((props: PopupDataViewProps<T>) => JSX.Element)}
 */
const PopupDataView = ({loader, children, errorTitle, errorDetails, hideDismissButton, style}) => {
  const render = children;
  console.assert(typeof render === 'function', 'Child must be a function');

  const { params } = useRoute();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [object, setObject] = useState(null);
  const content = React.useMemo(() => object ? render(object) : null, [object]);

  React.useEffect(() => {
    setLoading(true);
    loader(params)
      .then(setObject, setError)
      .finally(_ => setLoading(false));
  }, [params, loader]);

  if (loading)
    return <Loading style={{ marginTop: 150 }}/>;

  if (error) {
    return (
      <View style={[$S.container, style]}>
        {!hideDismissButton && <DismissButton color="black"/>}
        <PopupHeader
          title={errorTitle(error)}
          image={<Ionicons name={'ios-alert'} size={60} color="maroon"
                           style={{ textAlign: 'center', height: 60, width: 70, }} />}
        />
        <Text style={[$S.body, $S.bodyContainer]}>
          {errorDetails(error)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[$S.container, $S.form, style]}>
      {!hideDismissButton && <DismissButton color="black"/>}
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  popupHeaderPicture: {
    width: '35%',
    height: 140,
    marginRight: 10,
  },
  popupHeaderDetails: {
    flexDirection: 'column',
    flex: 1,
  },
  popupHeaderTitle: {
    fontSize: 30,
  },
});

export default PopupDataView;
