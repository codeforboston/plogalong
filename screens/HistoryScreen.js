import * as React from 'react';
import { useEffect } from 'react';
import {
  Text,
  View,
} from 'react-native';
import {connect} from 'react-redux';

import * as actions from '../redux/actions';
import { formatDuration, getStats } from '../util';
import Colors from '../constants/Colors';
import $S from '../styles';

import AchievementSwipe from '../components/AchievementSwipe';
import Banner from '../components/Banner';
import Loading from '../components/Loading';
import PlogList from '../components/PlogList';


export const HistoryScreen = ({currentUser, history, likePlog, loadHistory, loading}) => {
  const monthStats = getStats(currentUser, 'month');
  const yearStats = getStats(currentUser, 'year');

  useEffect(() => {
    if (currentUser)
      loadHistory(currentUser.uid);
  }, [currentUser]);

  return (
    <View style={$S.screenContainer}>
      <PlogList plogs={history}
                currentUser={currentUser}
                likePlog={likePlog}
                header={
                  <View style={{ paddingTop: 20 }}>
                    <Banner>
                      {monthStats.count ?
                       `You plogged ${monthStats.count} time${monthStats.count === 1 ? '' : 's'} this month. ` :
                       'Today is a good day to plog! '}
                      {yearStats.milliseconds ?
                       `You plogged for ${formatDuration(yearStats.milliseconds)} this year.` : ''}
                    </Banner>

                    <View style={{
                      marginLeft: 20,
                      marginTop: 5
                    }}>
                      <Text style={$S.subheader}>Achievements</Text>
                      <AchievementSwipe achievements={currentUser.data.achievements} />
                    </View>
                  </View>
                }
                footer={
                  loading ?
                    <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 10 }}>
                      <Loading/>
                    </View>
                  :
                  <View style={{ height: 25 }} />
}
                loadNextPage={() => {
                  if (currentUser && !loading)
                    loadHistory(currentUser.uid, false);
                }}
      />
    </View>
  );
};

export default connect(({log, users}) => {
  const {plogData, history} = log;

  return {
    loading: log.historyLoading,
    history: history.map(id => plogData[id]).sort((a, b) => (b.when - a.when)),
    currentUser: users.current,
  };
}, dispatch => ({
  likePlog: (...args) => dispatch(actions.likePlog(...args)),
  loadHistory: (...args) => dispatch(actions.loadHistory(...args)),
}))(HistoryScreen);
