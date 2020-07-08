import * as React from 'react';
import {
  View,
  Text
} from 'react-native';
import {connect} from 'react-redux';

import * as actions from '../redux/actions';
import { keep } from '../util/iter';
import $S from '../styles';

import Banner from '../components/Banner';
import Loading from '../components/Loading';
import PlogList from '../components/PlogList';


const LocalScreen = ({history, currentUser, likePlog, loading, loadLocalHistory}) => {
  React.useEffect(() => {
    loadLocalHistory();
  }, []);

  return (
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
                          "There are no other ploggers nearby.\nStart a trend!"
                          :
                          `There are ${history.length} ploggers nearby.`
                      }
                    </Banner>
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
      />
    </View>
)};

export default connect(({log, users}) => {
  const {plogData, localPlogs} = log;

  return {
    history: keep(id => plogData[id], localPlogs).sort((a, b) => (b.when - a.when)),
    currentUser: users.current,
    loading: log.localPlogsLoading,
  };
}, dispatch => ({
  likePlog: (...args) => dispatch(actions.likePlog(...args)),
  loadLocalHistory: (...args) => dispatch(actions.loadLocalHistory(...args)),
}))(LocalScreen);
