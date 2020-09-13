import * as React from 'react';
import {
    SafeAreaView,
    Text,
    View,
} from 'react-native';

import { auth } from '../firebase/init';

import Button from '../components/Button';
import Error from '../components/Error';
import ModalHeader from '../components/ModalHeader';

import { useSelector } from '../redux/hooks';

import $S from '../styles';

export default () => {
    const currentUser = useSelector(state => state.users.current);
    const [error, setError] = React.useState(null);
    const [sendStatus, setSendStatus] = React.useState(/** @type {'sending'|'sent'|null} */ null);

    const emailVerification = async () => {
        try {
            setSendStatus('sending')
            await auth.currentUser.sendEmailVerification();
            setSendStatus('sent')
        } catch (error) {
            setError('Unable to send verification link')
            setSendStatus(null)
        }
    };

    return (
        <SafeAreaView style={$S.safeContainer}>
            <View style={[$S.container, $S.form]}>
                <ModalHeader dismissButtonColor="black">
                    Verify Email
                </ModalHeader>

                <Text style={$S.body}>
                    You should have received an email at {currentUser.email} containing a link to verify your account. If you did not, click the button below to re-send.
                </Text>
                {error && <Error error={error} />}
                {currentUser.emailVerified ?
                    <Text style={$S.body}>
                        Your email is now verified!
                    </Text> :
                    sendStatus === 'sent' ?
                    <Text> Email Verification Sent</Text> :
                    <Button primary
                        title="Resend Link"
                        onPress={emailVerification}
                        disabled={sendStatus === 'sending'}
                    />
            }
            </View>
        </SafeAreaView>
    );
};