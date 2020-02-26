import * as React from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';


export default class Selectable extends React.Component {
    renderChildren() {
        let selection = new Set(this.props.selection || []);

        return React.Children.map(this.props.children, child => (
            React.cloneElement(child, {selected: selection.has(child.getValue ? child.getValue() : child.props.value),
                                       style: [styles.child, child.props.style]})
        ));
    }
 
    render() {
        const {style} = this.props;

        return (
            <View style={[styles.selectable, style]}>
                {this.renderChildren()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    selectable: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start'
    },

    child: {
        flexGrow: 1
    }
});
