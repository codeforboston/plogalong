import * as React from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';

import ImageZoom from 'react-native-image-pan-zoom';

import { useDimensions } from '../util/native';

import DismissButton from '../components/DismissButton';


export default ({ route }) => {
  const { photos, index = 0 } = route.params;
  const { dimensions: size, onLayout } = useDimensions();
  return (
    <SafeAreaView style={styles.backdrop}>
      <DismissButton style={{ color: 'white' }}/>
      <FlatList data={photos}
                onLayout={onLayout}
                style={styles.backdrop}
                initialScrollIndex={index}
                renderItem={({item: {uri}}) => (
                  <View style={styles.photoPage}>
                    <ImageZoom
                      cropWidth={Dimensions.get('window').width}
                      cropHeight={Dimensions.get('window').height}
                      imageWidth={size.width}
                      imageHeight={size.height}>
                      <Image source={{ uri }} style={[styles.photo, size]}
                           resizeMode="contain"
                      />
                    </ImageZoom>
                  </View>
                )}
                getItemLayout={(_, i) => ({
                  length: size.width,
                  offset: size.width*i,
                  index: i
                })}
                keyExtractor={(_, i) => `${i}`}
                horizontal
                pagingEnabled
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'black',
    flex: 1,
  },
  photo: {
    flexGrow: 1,
    resizeMode: 'contain'
  },
  photoPage: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
    justifyContent: 'center',
  }
});
