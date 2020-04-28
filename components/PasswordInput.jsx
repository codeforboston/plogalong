import * as React from 'react';
import { useState } from 'react';

import TextInputWithIcon from './TextInputWithIcon';


const makeToggle = (init=false) => {
  const [status, setStatus] = useState(init);
  return [
    status,
    () => setStatus(isOn => !isOn),
    setStatus
  ];
};

/**
 * @typedef {Omit<React.ComponentProps<typeof TextInputWithIcon>, 'icon' | 'iconName' | 'secureTextEntry' | 'onPress'> & { defaultVisible?: boolean }} PasswordInputProps
 */

/** @type {React.FunctionComponent<PasswordInputProps>} */
const PasswordInput = ({defaultVisible=false, ...props}) => {
  const [showPassword, toggleShow] = makeToggle(defaultVisible);

  return (
    <TextInputWithIcon autoCompleteType="password"
                       iconName={showPassword ? 'ios-eye-off' : 'ios-eye'}
                       secureTextEntry={!showPassword}
                       onPress={toggleShow}
                       {...props}
    />
  );
};

export default PasswordInput;
