import React from 'react';
import {
    ScrollView,
    Text,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import {connect} from 'react-redux';

import Colors from '../constants/Colors';

//import AchievementBadge from '../components/AchievementBadge';
import HistoryBanner from '../components/HistoryBanner';
import AchievementSwipe from '../components/AchievementSwipe';
import PlogList from '../components/PlogList';


class HistoryScreen extends React.Component {
  render() {
    return (
        <View>
            <ScrollView style={styles.container}>
                <HistoryBanner />
                <View style={{
                    marginLeft: 20,
                    marginTop: 10
                }}>
                    <Text style={{
                        fontSize: 25,
                        marginLeft: 5,
                        color: Colors.textGray
                    }}>Achievements</Text>
                    <AchievementSwipe />
                </View>
              <PlogList plogs={this.props.history.toArray()}
                        currentUserID={this.props.currentUser.uid} />
                <View style={{ height: 25 }} />
            </ScrollView>
        </View>
    );
  }
}

export default connect(store => ({
    history: store.log.get('history').sort((a, b) => (b.get('when') - a.get('when'))),
    currentUser: store.users.get('current').toJS(),
}))(HistoryScreen);
