import * as React from 'react';
import {
    ScrollView,
    Text,
    View,
} from 'react-native';
import {connect} from 'react-redux';

import { formatDuration, getStats } from '../util';
import Colors from '../constants/Colors';
import $S from '../styles';

import Banner from '../components/Banner';
import AchievementSwipe from '../components/AchievementSwipe';
import PlogList from '../components/PlogList';


class HistoryScreen extends React.Component {
  render() {
    const {currentUser} = this.props;

    const monthStats = getStats(currentUser, 'month');
    const yearStats = getStats(currentUser, 'year');

    return (
        <View style={$S.screenContainer}>
          <PlogList plogs={this.props.history.toArray()}
                    currentUser={currentUser}
                    header={
                        <View style={{ paddingTop: 20 }}>
                      <Banner>
                        You plogged {monthStats.count} time{monthStats.count === 1 ? '' : 's'} this month. You plogged for {formatDuration(yearStats.milliseconds)} this year.
                      </Banner>
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
