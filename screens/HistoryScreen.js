import * as React from 'react';
import { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {connect} from 'react-redux';

import * as actions from '../redux/actions';
import { formatDuration, getStats } from '../util';
import Colors from '../constants/Colors';
import $S from '../styles';

import AchievementBadge from '../components/AchievementBadge';
import AchievementSwipe from '../components/AchievementSwipe';
import Banner from '../components/Banner';
import Loading from '../components/Loading';
import { NavLink } from '../components/Link';
import PlogList from '../components/PlogList';

const L = ({to, params, ...props}) => <NavLink style={styles.link} route={to} params={params} {...props} />;

const renderEmpty = () => (
  <View style={[$S.screenContainer, styles.empty]}>
    <Text style={[$S.headline, styles.headline]}>
      You haven't plogged anything yet!
    </Text>
    <AchievementBadge achievement="firstPlog"
                      style={{ backgroundColor: '#eee' }}
                      showDescription={true} />
    <Text style={[$S.subheader, styles.subheader]}>
      <L to="More" params={{ subscreen: 'About' }}>Check the About Screen</L> for some tips. Once you've plogged something,
      record it on the <L to="Plog">Plogging Screen</L> to get your first achievement!
    </Text>
  </View>
);

export const HistoryScreen = ({currentUser, history, loadHistory, loading}) => {
  const monthStats = getStats(currentUser, 'month');
  const yearStats = getStats(currentUser, 'year');

  useEffect(() => {
    if (currentUser)
      loadHistory(currentUser.uid);
  }, [currentUser]);

  if (!loading && !history.length)
    return renderEmpty();

  return (
    <View style={$S.screenContainer}>

      <PlogList plogs={history}
                currentUser={currentUser}
                header={
                  <View style={{ paddingTop: 20 }}>
                    <Banner>
                      {monthStats.count ?
                       `You plogged ${monthStats.count} time${monthStats.count === 1 ? '' : 's'} this month. ` :
                       "You haven't plogged yet."}
                      {yearStats.milliseconds ?
                       `You earned ${formatDuration(yearStats.milliseconds, true)} this year.` : ''}
                    </Banner>
                    <View style={{
                      marginTop: 5
                    }}>
                      <AchievementSwipe
                        achievements={currentUser.data.achievements}
                        style={{marginLeft: 20, marginBottom: 15, marginTop: 25}}
                      />
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

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    flexDirection: 'column',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headline: {
    textAlign: 'center',
    paddingTop: 30,
    paddingBottom: 40,
  },

  subheader: {
    flexGrow: 1,
    marginTop: 30,
  },

  link: {
    color: 'black',
    textDecorationLine: 'underline',
    textDecorationColor: Colors.selectionColor,
  }
});

export default connect(({log, users}) => {
  const {plogData, history} = log;

  return {
    loading: log.historyLoading,
    history: history.map(id => plogData[id]).sort((a, b) => (b.when - a.when)),
    currentUser: users.current,
  };
}, dispatch => ({
  loadHistory: (...args) => dispatch(actions.loadHistory(...args)),
}))(HistoryScreen);
