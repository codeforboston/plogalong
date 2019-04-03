import React from 'react';
import {
    FlatList,
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
            <FlatList data={this.props.history.toArray()}
                      renderItem={({item}) => (<Plog plogInfo={item} />)}
                      keyExtractor={(_, i) => ''+i}>
            </FlatList>
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
