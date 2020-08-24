import * as React from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

import { useDimensions } from '../util/native';

import DismissButton from '../components/DismissButton';


export default ({ route }) => {
  const { photos } = route.params;
  const { dimensions: size, onLayout } = useDimensions();

  return (
    <SafeAreaView style={styles.backdrop}>
      <DismissButton style={{ color: 'white' }}/>
      <FlatList data={photos}
                onLayout={onLayout}
                style={styles.backdrop}
                renderItem={({item: {uri}}) => (
                  <View style={styles.photoPage}>
                    <Image source={{ uri }} style={[styles.photo, size]}
                           resizeMode="contain"
                    />
                  </View>
                )}
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
