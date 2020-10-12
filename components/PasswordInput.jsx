import * as React from 'react';

import { useToggle } from '../util/react';

import TextInputWithIcon from './TextInput';


/**
 * @typedef {Omit<React.ComponentProps<typeof TextInputWithIcon>, 'icon' | 'iconName' | 'secureTextEntry' | 'onPress'> & { defaultVisible?: boolean }} PasswordInputProps
 */

/** @type {React.FunctionComponent<PasswordInputProps>} */
const PasswordInput = ({defaultVisible=false, ...props}) => {
  const [showPassword, toggleShow] = useToggle(defaultVisible);

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
