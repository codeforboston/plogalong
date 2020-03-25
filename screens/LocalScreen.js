import * as React from 'react';
import {
    ScrollView,
    View,
} from 'react-native';
import {connect} from 'react-redux';

import * as actions from '../redux/actions';
import $S from '../styles';

import Banner from '../components/Banner';
import PlogList from '../components/PlogList';


class LocalScreen extends React.Component {
    render() {
      const {history, currentUser} = this.props;

        return (
            <View style={$S.screenContainer}>
                <PlogList plogs={history.toArray()}
                          currentUser={currentUser}
                          likePlog={this.props.likePlog}
                          header={
                              <View style={{ paddingTop: 20 }}>
                                <Banner>
                                  You're near a beach. Straws and plastic bags pose the biggest problem.
                                </Banner>
                              </View>
                          }
                          footer={
                              <View style={{ height: 25 }} />
                          }
                />
            </View>
        );
    }
}

export default connect(({log, users}) => {
  const plogs = log.get('plogData');

  return {
    history: log.get('localPlogs').map(id => plogs.get(id)).sort((a, b) => (b.get('when') - a.get('when'))),
    currentUser: users.get('current').toJS(),
  };
}, dispatch => ({
  likePlog: (...args) => dispatch(actions.likePlog(...args)),
}))(LocalScreen);
