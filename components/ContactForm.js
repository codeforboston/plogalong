import React from 'react';
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

export default ContactForm = () => {
    const placeholder = {
        label: 'Select a topic...',
        value: '',
    }
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
                onSubmit={ (values, actions) => {
                    alert('Thank you for your submission!')
                    actions.resetForm()
                    console.log(values) 
                }}
                validationSchema={contactSchema}
            >
                {({handleChange, handleSubmit, setFieldValue, values, touched, errors}) => (
                    <View style={styles.contactInfoContainer}>
                        <View style={$S.inputGroup}>
                            <Text style={[$S.inputLabel]}> Topic </Text>
                            <View style={[$S.textInput, styles.input]}>
                                <RNPickerSelect
                                    placeholder={placeholder}
                                    selectedValue={values.topic}
                                    useNativeAndroidPickerStyle={false}
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
                                style={[styles.inputComment, $S.textInput, styles.input]}
                                placeholder='Comment'
                                onChangeText={handleChange('comment')}
                                value={values.comment}                               
                            />
                            <Text style={styles.errorText}>{touched.comment && errors.comment}</Text>
                            <Text style={[$S.inputLabel, styles.titleText]}> Name (optional) </Text>
                            <TextInput
                                style={[$S.textInput, styles.input ]}
                                placeholder='Name'
                                onChangeText={handleChange('name')}
                                value={values.name}          
                            />
                            <Text style={[$S.inputLabel, styles.titleText]}> Email (optional) </Text>
                            <TextInput
                                style={[$S.textInput, styles.input]}
                                placeholder='Email'
                                onChangeText={handleChange('email')}
                                value={values.email}
                            />
                            <Text style={styles.errorText}>{touched.email && errors.email}</Text>
                            <View style={styles.submitButtonSection}>
                                <Button 
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
        borderRadius: 6,
        fontSize: 14,
    },
    submitButtonSection: {
        alignItems: 'center'
    },  
    submitButton: {
        borderWidth: 0,
        fontSize: 14,
        width: '50%',
        flexDirection: 'column',
    }   
});
