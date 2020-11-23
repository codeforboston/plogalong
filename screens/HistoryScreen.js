import * as React from 'react';
import { useEffect } from 'react';
import {
  View,
  ScrollView,
} from 'react-native';
import { shallowEqual } from 'react-redux';
import { useDispatch, useLocation, useSelector } from '../redux/hooks';
import { useNavigation } from '@react-navigation/native';

import * as actions from '../redux/actions';
import { formatPloggingMinutes } from '../util/string';
import { getStats, calculateTotalPloggingTime, processAchievement } from '../util/users';
import { mapcat } from '../util/iter';
import Colors from '../constants/Colors';
import Options from '../constants/Options';
import $S from '../styles';

import AchievementSwipe from '../components/AchievementSwipe';
import Banner from '../components/Banner';
import Loading from '../components/Loading';
import PlogList from '../components/PlogList';
import MapView, { Marker } from 'react-native-maps';
import Button from '../components/Button';


const BlankSlate = () => {
  const ActivityIcon = Options.activities.get('walking').icon;
  const navigation = useNavigation();
  const location = useLocation();

  const goToPlogScreen = React.useCallback(() => {
    navigation.navigate('Plog');
  }, [navigation]);

  return (
    <ScrollView style={$S.screenContainer} contentContainerStyle={$S.scrollContentContainer}>
      <Banner>
        You haven't plogged yet.{'\n'}Plog to earn your first badge!
      </Banner>
      <View style={$S.mapContainer}>
        {location ?
          <MapView
            style={[$S.map]}
            camera={location && {
              center: location,
              pitch: 0,
              heading: 0,
              altitude: 10000,
              zoom: 14
            }}
              showsMyLocationButton={false}
              showsTraffic={false}
              showsUserLocation={false}
              zoomControlEnabled={false}
            >
              <Marker coordinate={location}
                tracksViewChanges={true}
              >
                <ActivityIcon
                  width={40}
                  height={40}
                  fill={Colors.activeColor}
                />
              </Marker>
            </MapView> :
          <View style={$S.map} />
      }
      </View>
      <View style={$S.footerButtons}>
        <Button title="Plog"
          large primary
          onPress={goToPlogScreen}
        />
      </View>
    </ScrollView>
  )
};

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
  }, [currentUser.data.achievements, plogData]);

  const combinedHistory = React.useMemo(() => (
    mapcat((id => [
      ...(achievementsByRefID[id] || []),
      plogData[id]
    ]), history)
  ) , [history, plogData, achievementsByRefID]);

  const loadNextPage = React.useCallback(() => {
    if (currentUser)
      dispatch(actions.loadHistory(currentUser.uid, false));
  }, [currentUser]);

  const monthStats = getStats(currentUser, 'month');
  const totalStats = getStats(currentUser, 'total');

  useEffect(() => {
    if (currentUser)
      dispatch(actions.loadHistory(currentUser.uid));
  }, [currentUser && currentUser.uid]);

  if (!loading && !history.length)
    return <BlankSlate />;

  return (
    <View style={$S.screenContainer}>

      <PlogList plogs={combinedHistory}
                currentUser={currentUser}
                header={
                  <View style={{ paddingTop: 20 }}>
                    <Banner>
                      {
                        totalStats.count ?
                          monthStats.count ?
                          `You plogged ${monthStats.count} time${monthStats.count === 1 ? '' : 's'} this month.` :
                          "You haven't plogged yet this month." :
                        "Plog something to earn your first badge!"
                      }
                      {totalStats.count ?
                       `\nYou've earned ${formatPloggingMinutes(calculateTotalPloggingTime(totalStats))}.` : ''}
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


export default HistoryScreen;
