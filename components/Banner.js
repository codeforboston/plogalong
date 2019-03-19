import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';


const Banner = (props) => (
    <View>
        <Text style={styles.container}>
            {props.children}
        </Text>
    </View>
);

export default Banner;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faedce',
        borderColor: '#c2c1ba',
        borderWidth: 1,
        marginLeft: 20,
        marginRight: 20,
        padding: 5,
        textAlign: 'center'
    },
    contentContainer: {
        paddingTop: 30,
    },
});
