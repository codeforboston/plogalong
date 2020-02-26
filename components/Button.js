import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback
} from 'react-native';

import Colors from '../constants/Colors';
import $S from '../styles';


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
        const {icon, activeIcon, disabled, large, primary, title, selected, selectedIcon, style, ...props} = this.props,
              {active} = this.state,
              sharedStyles = [$S.button, !disabled && active && $S.activeButton,
                              disabled && styles.disabled, selected && styles.selected,
                              primary && $S.primaryButton, (large || primary) && $S.largeButton];

        if (icon) {
            const shownIcon = (selected && selectedIcon) || (active && activeIcon) || icon,
                  iconComponent = typeof shownIcon === 'function' ?
                                  React.createElement(shownIcon, {style: styles.iconStyles}) :
                                  React.cloneElement(shownIcon, {style: [styles.iconStyles, shownIcon.props.style]});

            return (
                <View style={[...sharedStyles, styles.iconButton, style]}>
                    {iconComponent}
                </View>
            );
        }

        if (title) {
            return (
                <Text style={[...sharedStyles, $S.textButton, style]}>
                    {title}
                </Text>
            );
        }
    }

    render() {
        const {accessibilityLabel, disabled, selected, title, ...props} = this.props,
              {active} = this.state;

        if (disabled)
            return this.renderContent();

        return (
            <TouchableWithoutFeedback accessibilityLabel={accessibilityLabel || title}
                                      accessibilityRole="button"
                                      accessibilityState={{selected: !!selected}}
                                      onPressIn={this.onPressIn}
                                      onPressOut={this.onPressOut}
                                      {...props}>
                {this.renderContent()}
            </TouchableWithoutFeedback>
        );
    }
}


const styles = StyleSheet.create({
    disabled: {
        opacity: 0.8
    },

    iconButton: {
        width: 50,
        height: 50,
    },

    selected: {
        borderColor: Colors.selectionColor
    },

    iconStyles: {
        flex: 1
    }
});
