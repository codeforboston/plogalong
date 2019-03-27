import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {connect} from 'react-redux';
import * as actions from '../redux/actions';

const Plog = ({plogInfo}) => (
    <Text>
        You picked up {plogInfo.trashTypes.join(', ')} at {plogInfo.when.toString()}
    </Text>
);

class HistoryScreen extends React.Component {
  render() {
    return (
        <ScrollView style={styles.container}>
            {this.props.history.map((plogInfo, i) => (
                <Plog plogInfo={plogInfo} key={i} />
            ))}
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});


export default connect(store => ({
    history: store.log.history
}))(HistoryScreen);
