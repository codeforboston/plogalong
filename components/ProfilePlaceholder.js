
import React from 'react';
import icons from '../icons';

const ProfilePlaceholder = ({style: {width=100, height=80, ...style}={}, ...props}) => {
  return <icons.Profile fill="#666666" width={width} height={height} style={style} {...props} />;
}

export default ProfilePlaceholder;
