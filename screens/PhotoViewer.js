import * as React from 'react';
import { useCallback, useState } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    View,
} from 'react-native';

import DismissButton from '../components/DismissButton';


export default class PhotoViewer extends React.Component {
    state = { size: { width: 400, height: 800 }}

    onLayout = e => {
        this.setState({
            size: { width: e.nativeEvent.layout.width,
                    height: e.nativeEvent.layout.height }
        });
    }

    render() {
        const {photos} = this.props.route.params;
        const {size} = this.state;

        return (
            <SafeAreaView style={styles.backdrop}>
              <DismissButton style={{ color: 'white' }}/>
              <FlatList data={photos}
                        onLayout={this.onLayout}
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
    }
}


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
