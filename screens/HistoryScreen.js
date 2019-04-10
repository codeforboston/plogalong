import React from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import moment from 'moment';

import {connect} from 'react-redux';

import ProfileImage from '../assets/images/profile.png';


const Plog = ({plogInfo}) => (
    <View style={styles.plogStyle}>
        <Image source={ProfileImage} style={styles.profileImage} />
        <View>
            <Text styles={styles.actionText}>
                You {plogInfo.get('pickedUp') ? 'picked up' : 'flagged'}&nbsp;
                {plogInfo.get('trashTypes').join(', ')} at {JSON.stringify(plogInfo.get('location'))}
            </Text>
            <Text styles={styles.timeText}>
                {moment(plogInfo.get('when')).fromNow()}
            </Text>
        </View>
    </View>
);

const Divider = () => (
    <View style={styles.divider}></View>
);

class HistoryScreen extends React.Component {
  render() {
    return (
        <ScrollView style={styles.container}>
            <FlatList data={this.props.history.toArray()}
                      renderItem={({item}) => (<Plog plogInfo={item} />)}
                      keyExtractor={(_, i) => ''+i}
                      ItemSeparatorComponent={Divider}>
            </FlatList>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    plogStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 10
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: 'gray'
    },
    profileImage: {
        margin: 10
    },
    actionText: {

    },
    timeText: {

    }
});


export default connect(store => ({
    history: store.log.get('history').sort((a, b) => (b.get('when') - a.get('when')))
}))(HistoryScreen);
