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
                       "You haven't plogged yet."}
                      {yearStats.milliseconds ?
                       `You earned ${formatDuration(yearStats.milliseconds)} plogging this year.` : ''}
                    </Banner>
                    <View style={{
                      marginTop: 5
                    }}>
                      <Text style={$S.h1}>Achievements</Text>
                      <AchievementSwipe
                        achievements={currentUser.data.achievements}
                        style={{marginLeft: 10}}
                      />
                    </View>
                    <Text style={$S.h1}>Your Feed</Text>
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
