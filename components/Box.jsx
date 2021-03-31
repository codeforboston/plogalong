import * as React from 'react';

import { 
    View,
    ViewProps,
    StyleSheet,
 } from "react-native";

import Colors from '../constants/Colors';


/** @type {React.FC<ViewProps>} */
const Box = ({ style, content, ...props }) => (
    <View style={[styles.box, style]} {...props}>
        {content}
    </View>
);

const styles = StyleSheet.create({
    box: {        
        borderRadius: 3,
        borderColor: Colors.selectionColor,
        borderWidth: 1.5,
        backgroundColor: Colors.lightGrayBackground,
        justifyContent: "center",
        padding: 5,
        alignItems: 'center',
        margin: 5,
    } 
});

export default Box;