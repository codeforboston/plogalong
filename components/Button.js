import React from 'react';
import {
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
        const {icon, activeIcon, title, selected, selectedIcon, style, ...props} = this.props,
              {active} = this.state;

        if (icon) {
            const shownIcon = (selected && selectedIcon) || (active && activeIcon) || icon,
                  iconComponent = typeof shownIcon === 'function' ?
                                  React.createElement(shownIcon, {style: styles.iconStyles}) :
                                  React.cloneElement(shownIcon, {style: [styles.iconStyles, shownIcon.props.styles]});

            return (
                <View style={[styles.button, styles.iconButton, active && styles.active, selected && styles.selected, style]}>
                    {iconComponent}
                </View>
            );
        }

        if (title) {
            return (
                <Text style={[styles.button, styles.buttonText, active && styles.active,
                              selected && styles.selected, style]}>
                    {title}
                </Text>
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

    iconButton: {
        width: 50,
        height: 50
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
    },

    iconStyles: {
        flex: 1
    }
});
