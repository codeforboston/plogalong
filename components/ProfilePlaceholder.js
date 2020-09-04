import React from 'react';
import flattenStyle from 'react-native/Libraries/StyleSheet/flattenStyle';

import icons from '../icons';


const ProfilePlaceholder = ({style: _style, ...props}) => {
  const {width=100, height=80, ...style} = flattenStyle(_style);

  return <icons.Profile fill="#666666" width={width} height={height} style={style} {...props} />;
}

export default ProfilePlaceholder;
