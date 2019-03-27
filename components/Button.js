import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback
} from 'react-native';

import Colors from '../constants/Colors';

/*
   TODO Add support for buttons with icons and text
 */

export default class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false
        };
    }

    onPressIn = (e) => {
        this.setState({ active: true });
    }

    onPressOut = (e) => {
        this.setState({ active: false });
    }

    renderContent() {
        const {icon, title, selected, style, ...props} = this.props,
              {active} = this.state;

        if (title) {
            return (
                <Text style={[styles.button, styles.buttonText, active && styles.active,
                              selected && styles.selected, style]}>
                    {title}
                </Text>
            );
        }

        if (icon) {
            return (
                <Image style={[styles.button, styles.icon, active && styles.active,
                               selected && styles.selected, style]}
                       accessibilityIgnoresInvertColors={this.props.accessibilityIgnoresInvertColors}/>
            );
        }
    }

    render() {
        const {accessibilityLabel, selected, title, ...props} = this.props,
              {active} = this.state;

        return (
            <TouchableWithoutFeedback accessibilityLabel={accessibilityLabel || title}
                                      accessibilityRole="button"
                                      accessibilityState={selected ? ['selected'] : null}
                                      onPressIn={this.onPressIn}
                                      onPressOut={this.onPressOut}
                                      {...props}>
                {this.renderContent()}
            </TouchableWithoutFeedback>
        );
    }
}


const styles = StyleSheet.create({
    button: {
        borderRadius: 5,
        borderColor: Colors.secondaryColor,
        borderWidth: 2,
        margin: 5,
        padding: 5,
    },

    buttonText: {
        textAlign: 'center'
    },

    selected: {
        borderColor: Colors.selectionColor
    },

    active: {
        backgroundColor: '#cccccc',
        borderColor: Colors.activeColor
    }
});
