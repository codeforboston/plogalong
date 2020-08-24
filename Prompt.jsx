import * as React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import $S from './styles';

import Button from './components/Button';
import ModalHeader from './components/ModalHeader';
import Error from './components/Error';
import { LoadingOverlay } from './components/Loading';
import { useEffectWithPrevious } from './util/react';


const Context = createContext(null);
export const PromptProvider = Context.Provider;
export const PromptConsumer = Context.Consumer;

const defaultErrorRenderer = e => <Error error={e}/>;

/** @type {React.FunctionComponent<PromptProps>} */
export const PromptComponent = props => {
  const {title, body, message, options=[], onCancel, dismiss, renderError=defaultErrorRenderer} = props;
  const [isBusy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [busyMessage, setMessage] = useState(null);

  return (
    <Modal animationType="slide"
           transparent={false}
           onRequestClose={React.useCallback(() => dismiss(), [dismiss])}>
      <SafeAreaView style={$S.safeContainer}>
        <View style={[$S.container]}>
          <View style={{ flex: 1 }}>
            {title && <ModalHeader onPressDismiss={onCancel}>
                        {title}
                      </ModalHeader>}
            {React.useMemo(
              () => (error ? renderError(error) : null),
              [error, renderError])}
            <Text style={[$S.subheader, styles.subheader]}>
              {message}
            </Text>
          </View>
          {body && <View style={{ flex: 1 }}>{body}</View>}
          <View style={$S.footerButtons}>
            {React.useMemo(
              () => options.map((option, i) => (
                <Button title={option.title}
                        style={option.style}
                        primary={!i}
                        large
                        key={i}
                        disabled={isBusy}
                        onPress={async () => {
                          try {
                            const promise = option.run && option.run(setMessage);
                            if (promise && promise.then) {
                              setBusy(true);
                              if (option.message)
                                setMessage(option.message);
                              await promise;
                            }
                            dismiss(option.value);
                          } catch (err) {
                            setError(err);
                          } finally {
                            setBusy(false);
                            setMessage('');
                          }
                        }}/>
              )), [options, isBusy])}
          </View>
          {isBusy && <LoadingOverlay>
           {busyMessage && (typeof busyMessage == 'string' ?
                            <Text style={[$S.subheader, styles.busyMessage]}>{busyMessage}</Text> :
                            busyMessage)}
         </LoadingOverlay>}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

/** @typedef {React.ComponentProps<typeof Button>} ButtonProps */
/**
 * @typedef {Pick<ButtonProps, 'style' | 'title'> & {
 *   run?: (setMessage: string) => any,
 *   message?: string,
 *   value?: any,
 }} PromptOption
 */
/**
 * @typedef {object} PromptProps
 * @property {string} title
 * @property {string} message
 * @property {React.ReactChild} body
 * @property {() => React.ReactChild} [renderError]
 * @property {PromptOption[]} options
 * @property {() => ()} [onCancel]
 * @property {boolean} shown
 */

/**x @type {React.FunctionComponent<PromptProps>} */

export const usePrompt = () => {
  const { setPrompt } = useContext(Context);
  /** @type {(options: PromptProps) => Promise<any>} */
  const prompt = useCallback(promptOptions => {
    const {onCancel, ...options} = promptOptions;

    return new Promise((resolve) => {
      setPrompt({
        ...options,
        onCancel: onCancel ? () => {
          onCancel();
          resolve(null);
        } : () => resolve(null),
        dismiss: resolve
      });
    }).finally(_ => {
      setPrompt(null);
    });
  }, [setPrompt]);

  return { prompt };
};

export const PromptRenderer = ({children}) => {
  const [prompt, setPrompt] = useState(null);
  useEffectWithPrevious(lastPrompt => {
    if (lastPrompt && lastPrompt.onCancel)
      lastPrompt.onCancel();
  }, [prompt]);

  return (
    <PromptProvider value={{ setPrompt }}>
      {children}
      {prompt && <PromptComponent {...prompt}/>}
    </PromptProvider>
  );
};

const styles = StyleSheet.create({
  subheader: {
    flex: 1,
    marginTop: 30,
  },
  busyMessage: {
    marginBottom: 30,
    textAlign: 'center',
  }
});
