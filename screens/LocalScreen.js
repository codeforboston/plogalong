import React from 'react';
import {
    ScrollView,
    Text,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import {connect} from 'react-redux';

import Colors from '../constants/Colors';
import $S from '../styles';

import Banner from '../components/Banner';
import PlogList from '../components/PlogList';


class LocalScreen extends React.Component {
    render() {
        const {history, currentUser: {uid} = {}} = this.props;

        return (
            <View style={$S.screenContainer}>
              <ScrollView style={$S.screenContainer} contentContainerStyle={$S.scrollContentContainer}>
                <Banner>
                  You're near a beach. Straws and plastic bags pose the biggest problem.
                </Banner>
                <PlogList plogs={history.toArray()}
                          filter={plog => plog.get('userID') !== uid}
                          currentUserID={uid} />
                <View style={{ height: 25 }} />
              </ScrollView>
            </View>
        );
    }
}

export default connect(store => ({
    history: store.log.get('localPlogs').sort((a, b) => (b.get('when') - a.get('when'))),
    currentUser: store.users.get('current').toJS(),
}))(LocalScreen);
