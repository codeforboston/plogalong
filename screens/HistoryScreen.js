import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import {connect} from 'react-redux';

const Plog = ({plogInfo}) => (
    <Text>
        You picked up {plogInfo.get('trashTypes').join(', ')} at {plogInfo.get('when').toString()}
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
    history: store.log.get('history')
}))(HistoryScreen);
