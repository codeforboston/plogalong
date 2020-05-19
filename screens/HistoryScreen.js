import * as React from 'react';
import {
    ScrollView,
    Text,
    View,
} from 'react-native';
import {connect} from 'react-redux';

import * as actions from '../redux/actions';
import { formatDuration, getStats } from '../util';
import Colors from '../constants/Colors';
import $S from '../styles';

import Banner from '../components/Banner';
import AchievementSwipe from '../components/AchievementSwipe';
import PlogList from '../components/PlogList';


class HistoryScreen extends React.Component {
  render() {
    const {currentUser, numberOfUsers} = this.props;

    const monthStats = getStats(currentUser, 'month');
    const yearStats = getStats(currentUser, 'year');

    return (
        <View style={$S.screenContainer}>
          <PlogList plogs={this.props.history}
                    currentUser={currentUser}
                    numberOfUsers={numberOfUsers}
                    likePlog={this.props.likePlog}
                    header={
                        <View style={{ paddingTop: 20 }}>
                      <Banner>
                        {numberOfUsers===1 ?
                        "No nearby ploggers." :
                        ""}
                        {monthStats.count ?
                         `You plogged ${monthStats.count} time${monthStats.count === 1 ? '' : 's'} this month. ` :
                         "You haven't plogged yet."}
                        {yearStats.milliseconds ?
                         `You plogged for ${formatDuration(yearStats.milliseconds)} this year.` : ''}
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
                            <AchievementSwipe achievements={currentUser.data.achievements} />
                          </View>
                        </View>
                    }
                    footer={<View style={{ paddingBottom: 20 }}/>}
          />
        </View>
    );
  }
}

export default connect(({log, users}) => {
  const {plogData, history} = log;

  return {
    history: history.map(id => plogData[id]).sort((a, b) => (b.when - a.when)),
    currentUser: users.current,
  };
}, dispatch => ({
  likePlog: (...args) => dispatch(actions.likePlog(...args)),
}))(HistoryScreen);
