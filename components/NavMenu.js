import * as React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Divider } from './Elements';


const MenuItem = ({label, detail, route, params, action, navigation, handlePress}) => {
  const onPress = React.useCallback(() => {
    if (handlePress) {
      handlePress();
    } else {
      navigation.push(route, params, action);
    }
  }, [handlePress, navigation, route, params, action]);

  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.menuItem}>
          <View style={styles.menuItemBody}>
            <Text style={styles.labelText}>{label || route}</Text>
            {detail && <Text style={styles.detailText}>{detail}</Text>}
          </View>
          <Text style={styles.menuItemRight}>
            {'>'}
          </Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

const NavMenu = ({routes}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <FlatList data={routes}
                keyExtractor={(item, i) => (item.route || `${i}`)}
                renderItem={
                  ({item}) => <MenuItem navigation={navigation} {...item}/>
                }
                ItemSeparatorComponent={Divider}
                ListFooterComponent={Divider}
                ListHeaderComponent={Divider}
      />
    </View>
  );
};

export default NavMenu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
