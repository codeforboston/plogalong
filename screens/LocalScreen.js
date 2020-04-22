import * as React from 'react';
import {
  View,
} from 'react-native';
import {connect} from 'react-redux';

import * as actions from '../redux/actions';
import $S from '../styles';

import Banner from '../components/Banner';
import Loading from '../components/Loading';
import PlogList from '../components/PlogList';


const LocalScreen = ({history, currentUser, likePlog, loading}) => (
  <View style={$S.screenContainer}>
    <PlogList plogs={history}
              currentUser={currentUser}
              likePlog={likePlog}
              header={
                <View style={{ paddingTop: 20 }}>
                  <Banner>
                    {
                      history.length === 0 && !loading
                        ?
                        "No nearby ploggers.\nPlog to earn your first badge."
                        :
                        "You're near a beach. Straws and plastic bags pose the biggest problem."
                    }
                  </Banner>
                </View>
              }
              footer={
                <View style={{ height: 25 }} />
              }
    />
  </View>
);

export default connect(({log, users}) => {
  const {plogData, localPlogs} = log;

  return {
    history: localPlogs.map(id => plogData[id]).sort((a, b) => (b.when - a.when)),
    currentUser: users.current,
    loading: log.localPlogsLoading,
  };
}, dispatch => ({
  likePlog: (...args) => dispatch(actions.likePlog(...args)),
}))(LocalScreen);
