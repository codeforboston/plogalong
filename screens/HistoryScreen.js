import * as React from 'react';
import {
    ScrollView,
    Text,
    View,
} from 'react-native';
import {connect} from 'react-redux';

import Colors from '../constants/Colors';
import $S from '../styles';

//import AchievementBadge from '../components/AchievementBadge';
import HistoryBanner from '../components/HistoryBanner';
import AchievementSwipe from '../components/AchievementSwipe';
import PlogList from '../components/PlogList';


class HistoryScreen extends React.Component {
  render() {
    return (
        <View style={$S.screenContainer}>
          <PlogList plogs={this.props.history.toArray()}
                    currentUserID={this.props.currentUser.uid}
                    header={
                        <View style={{ paddingTop: 20 }}>
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
                        </View>
                    }
                    footer={<View style={{ paddingBottom: 20 }}/>}
          />
        </View>
    );
  }
}

export default connect(store => ({
    history: store.log.get('history').sort((a, b) => (b.get('when') - a.get('when'))),
    currentUser: store.users.get('current').toJS(),
}))(HistoryScreen);
