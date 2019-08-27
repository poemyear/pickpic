import React, { Component } from 'react';
import { Alert, Button, Text, TouchableOpacity, TextInput, View, StyleSheet } from 'react-native';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
} from 'react-native';
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';
import t from 'tcomb-form-native';

const Form = t.form.Form;

const User = t.struct({
    email: t.String,
    username: t.String,
    password: t.String,
    terms: t.Boolean
});
interface Props {

}
interface State {
    email: string,
    password: string
}

class SignIn extends React.Component<Props, State> {
    state = {
        email: '',
        password: '',
    };


    onLogin() {
        const { email, password } = this.state;

        Alert.alert('Credentials', `email: ${email} + password: ${password}`);
    }

    switchSignup() {
        const { email, password } = this.state;

        Alert.alert('Credentials', `email: ${email} + password: ${password}`);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.titleText}>Pickpic</Text>
                <TextInput
                    value={this.state.email}
                    keyboardType='email-address'
                    onChangeText={(email) => this.setState({ email })}
                    placeholder='email'
                    placeholderTextColor='grey'
                    style={styles.input}
                />
                <TextInput
                    value={this.state.password}
                    onChangeText={(password) => this.setState({ password })}
                    placeholder={'password'}
                    secureTextEntry={true}
                    placeholderTextColor='grey'
                    style={styles.input}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={this.onLogin.bind(this)}
                >
                    <Text style={styles.buttonText}>로그인</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={this.switchSignup.bind(this)}
                >
                    <Text style={styles.buttonText}>간편 회원가입</Text>
                </TouchableOpacity>

            </View>
        );
    }
}

export default createAppContainer(createSwitchNavigator(
    {
        SignIn: SignIn,
        SignUp: SignUp
    },
    {
        initialRouteName: 'SignIn',
    }
));

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: 'salmon',
    },
    titleText: {
        //fontFamily: 'Baskerville',
        fontSize: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        alignItems: 'center',
        backgroundColor: 'powderblue',
        width: 200,
        height: 44,
        padding: 10,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 25,
        marginBottom: 10,
    },
    buttonText: {
        fontFamily: 'Baskerville',
        fontSize: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        width: 200,
        fontFamily: 'Baskerville',
        fontSize: 20,
        height: 44,
        padding: 10,
        borderWidth: 1,
        borderColor: 'grey',
        marginVertical: 10,
    },
});
