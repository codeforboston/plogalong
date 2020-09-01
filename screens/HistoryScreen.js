import * as React from 'react';
import { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { shallowEqual } from 'react-redux';
import { useDispatch, useSelector } from '../redux/hooks';

import * as actions from '../redux/actions';
import { formatDuration, getStats, keep } from '../util';
import Colors from '../constants/Colors';
import $S from '../styles';

import AchievementBadge from '../components/AchievementBadge';
import AchievementSwipe from '../components/AchievementSwipe';
import Banner from '../components/Banner';
import Loading from '../components/Loading';
import { NavLink } from '../components/Link';
import PlogList from '../components/PlogList';
import { processAchievement } from '../util/users';
import moment from 'moment';

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

export const HistoryScreen = _ => {
  const dispatch = useDispatch();
  const { currentUser, history, loading, plogData } = useSelector(({log, users}) => {
    return {
      loading: log.historyLoading,
      history: log.history,
      currentUser: users.current,
      plogData: log.plogData,
    };
  }, shallowEqual);

  /** @type {{ [k in string]: (ReturnType<typeof processAchievement>)[] }} */
  const achievementsByRefID = React.useMemo(() => {
    const achievementsByRefID = {};
    const { achievements } = currentUser.data;
    if (achievements) {
      for (const k in achievements) {
        const refID = achievements[k] && achievements[k].refID;
        if (refID && plogData[achievements[k].refID]) {
          const date = plogData[achievements[k].refID].when;
          const achievement = {
            type: 'achievement',
            id: k,
            achievement: processAchievement(achievements, k),
            date:  date,
          };
          if (refID in achievementsByRefID)
            achievementsByRefID[refID].push(achievement);
          else
            achievementsByRefID[refID] = [achievement];
        }
      }
    }
    return achievementsByRefID;
  }, [currentUser.data.achievements]);

  const combinedHistory = React.useMemo(() => {
    const combinedHistory = [];

    history.forEach(id => {
      if (achievementsByRefID[id]) {
        for (const achievement of achievementsByRefID[id]) {
          combinedHistory.push(achievement);
        }
      };

      combinedHistory.push(plogData[id]);
    });
    return combinedHistory;
  }, [history, plogData, achievementsByRefID]);

  const loadNextPage = React.useCallback(() => {
    if (currentUser && !loading)
      dispatch(actions.loadHistory(currentUser.uid, false));
  }, [currentUser, loading]);

  const monthStats = getStats(currentUser, 'month');
  const yearStats = getStats(currentUser, 'year');

  useEffect(() => {
    if (currentUser)
      dispatch(actions.loadHistory(currentUser.uid));
  }, [currentUser && currentUser.uid]);

  if (!loading && !history.length)
    return renderEmpty();

  return (
    <View style={$S.screenContainer}>

      <PlogList plogs={combinedHistory}
                currentUser={currentUser}
                header={
                  <View style={{ paddingTop: 20 }}>
                    <Banner>
                      {monthStats.count ?
                       `You plogged ${monthStats.count} time${monthStats.count === 1 ? '' : 's'} this month. ` :
                       "You haven't plogged yet.\nPlog to earn your first badge."}
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
                loadNextPage={loadNextPage}
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

export default HistoryScreen;
