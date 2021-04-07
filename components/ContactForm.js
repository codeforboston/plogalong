import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { Formik } from 'formik';
import $S from '../styles';
import Button from '../components/Button';
import RNPickerSelect from 'react-native-picker-select';
import * as yup from 'yup';

import Error from '../components/Error';
import { saveComment } from '../firebase/comments';
import Colors from '../constants/Colors';

const contactSchema = yup.object({
    topic: yup.string()
        .required()
        .label('Topic'),
    comment: yup.string()
        .required()
        .label('Comment')
        .min(10),
    email: yup.string()
        .email()
        .label('Email')
})

export default ContactForm = ({onSave}) => {
    const placeholder = {
        label: 'Select a topic...',
        value: '',
    };

    const [isSubmitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    return (
        <View style={[styles.contactContainer]}>
            <Formik
                initialValues={{
                    label: 'Select a topic...',
                    topic: '',
                    comment: '',
                    name: '',
                    email: ''
                }}
                validateOnMount={true}
                onSubmit={ (values, actions) => {
                  setSubmitting(true);
                  saveComment(values).then(
                    doc => {
                      actions.resetForm();

                      if (onSave) onSave(doc);
                    },
                    err => {
                      console.warn(err);
                      setSubmitError(err);
                    }
                  ).finally(_ => {
                    setSubmitting(false);
                  });
                }}
                validationSchema={contactSchema}
            >
                {({handleChange, handleSubmit, setFieldValue, values, touched, errors, isValid}) => (
                    <View style={styles.contactInfoContainer}>
                        <View style={$S.inputGroup}>
                          {submitError && <Error error={submitError} />}
                            <Text style={[$S.inputLabel]}> Topic </Text>
                            <View style={[$S.textInput, styles.input, styles.inputGreen]}>
                                <RNPickerSelect
                                    placeholder={placeholder}
                                    value={values.topic}
                                    useNativeAndroidPickerStyle={false}
                                    style={{ inputAndroid: { color: 'black' } }}
                                    onValueChange={(value) => setFieldValue('topic', value)}
                                items={[
                                        { label: 'Bug', value: 'bug' },
                                        { label: 'Feedback', value: 'feedback' },
                                        { label: 'Comment', value: 'comment' },
                                        { label: 'Other', value: 'other' },
                                    ]}
                                /> 
                            </View>
                            <Text style={styles.errorText}>{touched.topic && errors.topic}</Text>
                            <Text style={[$S.inputLabel, styles.titleText]}> Comment </Text>
                            <TextInput
                                multiline={true}
                                numberOfLines={10}
                                style={[styles.inputComment, $S.textInput, styles.input, styles.inputGreen]}
                                placeholder='Comment'
                                onChangeText={handleChange('comment')}
                                value={values.comment}
                                returnKeyType="done"
                            />
                            <Text style={styles.errorText}>{touched.comment && errors.comment}</Text>
                            <Text style={[$S.inputLabel, styles.titleText]}> Name (optional) </Text>
                            <TextInput
                                style={[$S.textInput, styles.input, styles.inputGreen ]}
                                placeholder='Name'
                                onChangeText={handleChange('name')}
                                value={values.name}
                                returnKeyType="done"
                            />
                            <Text style={[$S.inputLabel, styles.titleText]}> Email (optional) </Text>
                            <TextInput
                                style={[$S.textInput, styles.input, styles.inputGreen]}
                                placeholder='Email'
                                onChangeText={handleChange('email')}
                                value={values.email}
                                returnKeyType="done"
                            />
                            <Text style={styles.errorText}>{touched.email && errors.email}</Text>
                            <View style={styles.submitButtonSection}>
                                <Button 
                                    disabled={!isValid}
                                    primary
                                    title='Submit' 
                                    onPress={handleSubmit} 
                                    style={[$S.button, $S.primaryButton, styles.submitButton]}
                                />     
                            </View>
                        </View>
                    </View>
                )}
            </Formik>
        </View>  
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        padding: 20,
    },
    contactInfoContainer: {
        marginTop: -10,
        marginBottom: 10,
        justifyContent: 'center',
    },
    contactContainer: {
        borderRadius: 5,
        width: '90%',
        margin: 10,
        padding: 10,
    },
    titleText: {
        paddingTop: 20,
        fontSize: 13,
    },
    errorText: {
        color: '#ff0000',
        paddingTop: 5,
        textAlign: 'left',
    },
    inputComment: {
        height: 100,
        textAlignVertical: 'top'
    },  
    input: {
        borderWidth: 1,
        width: '100%',
        padding: 12,
        fontSize: 14,
    },
    inputGreen: {
        borderColor: Colors.secondaryColor,
        borderWidth: 2,
    },
    inputPurple: {
        borderColor: Colors.selectionColor,
        borderWidth: 2,
    },
    submitButtonSection: {
        alignItems: 'center'
    },  
    submitButton: {
        borderWidth: 0,
        fontSize: 18, // was 14
        width: '50%',
        flexDirection: 'column',
    }   
});
