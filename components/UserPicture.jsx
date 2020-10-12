import * as React from 'react';
import {
  Image,
  StyleSheet,
} from 'react-native';

import ProfilePlaceholder from './ProfilePlaceholder';


const UserPicture = React.memo(({ url, style }) => {
  const [error, setError] = React.useState(null);

  return url && !error ?
    <Image source={{ uri: url }}
           style={[styles.profileImage, style]}
           onError={e => setError(e.nativeEvent.error)}
    /> :
  <ProfilePlaceholder style={[styles.profileImage, style]} />;
});

export default UserPicture;

const styles = StyleSheet.create({
  profileImage: {
    margin: 10,
    marginBottom: 0,
    marginTop: 0,
    width: 50,
    height: 50,
  },
});
