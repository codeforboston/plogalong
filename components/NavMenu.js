import * as React from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { withNavigation } from 'react-navigation';

const Divider = () => (
    <View style={styles.divider}></View>
);


const MenuItem = ({label, detail, route, params, action, navigation, handlePress}) => {
  onPress = () => {
    if (handlePress) {
      handlePress();
    } else {
      navigation.push(route, params, action);
    }
  }

  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.menuItem}>
          <View style={styles.menuItemBody}>
            <Text style={styles.labelText}>{label}</Text>
            {detail && <Text style={styles.detailText}>{detail}</Text>}
          </View>
          <Text style={styles.menuItemRight}>
            {'>'}
          </Text>
        </View>
      </TouchableOpacity>
    </>
  );
}

class NavMenu extends React.Component {
    render() {
        const {navigation, routes} = this.props;
        return (
            <ScrollView style={styles.container}>
              <FlatList data={routes}
                        keyExtractor={(item, i) => (item.route || `${i}`)}
                        renderItem={
                            ({item}) => <MenuItem navigation={navigation} {...item}/>
                        }
                        ItemSeparatorComponent={Divider}
              />
              <Divider />
              <View style={{ height: 25 }} />
            </ScrollView>
        );
    }
}

export default withNavigation(NavMenu);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: 'gray'
    },
    menuItem: {
        flexDirection: 'row',
        paddingBottom: 10,
        paddingLeft: 10,
        paddingTop: 10,
    },
    menuItemBody: {
        flex: 1,
        flexDirection: 'column'
    },
    menuItemRight: {
        color: 'gray',
        flex: 0,
        fontSize: 20,
        paddingRight: 10,
        paddingLeft: 10,
    },
    labelText: {
        fontSize: 18
    },
    detailText: {
        color: 'gray',
        fontSize: 18
    }
});
