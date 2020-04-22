import * as React from 'react';
import {
  View,
} from 'react-native';
import {connect} from 'react-redux';

import * as actions from '../redux/actions';
import $S from '../styles';

import Banner from '../components/Banner';
import PlogList from '../components/PlogList';


class LocalScreen extends React.Component {
  render() {
    const {history, currentUser, numberOfUsers} = this.props;

    return (
      <View style={$S.screenContainer}>
        <PlogList plogs={history}
                  currentUser={currentUser}
                  numberOfUsers={numberOfUsers}
                  likePlog={this.props.likePlog}
                  header={
                    <View style={{ paddingTop: 20 }}>
                      <Banner>
                        {
                        numberOfUsers===1
                        ? 
                        "No nearby ploggers. Plog to earn your first badge."
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
  }
}

export default connect(({log, users}) => {
  const {plogData, localPlogs} = log;

  return {
    history: localPlogs.map(id => plogData[id]).sort((a, b) => (b.when - a.when)),
    currentUser: users.current,
    numberOfUsers: users.length,
  };
}, dispatch => ({
  likePlog: (...args) => dispatch(actions.likePlog(...args)),
}))(LocalScreen);
