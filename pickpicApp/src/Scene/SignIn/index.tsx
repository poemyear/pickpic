import React, { Component } from 'react';
import { Alert, Button, Text, TouchableOpacity, TextInput, View, StyleSheet } from 'react-native';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
} from 'react-native';
import { NavigationActions } from 'react-navigation'

interface Props {
    navigation: any
}
interface State {
    email: string,
    password: string
}

export default class SignIn extends React.Component<Props, State> {
    state = {
        email: '',
        password: '',
    };
    serverAddress = "http://localhost:3000";
    LoginRoutes = this.serverAddress + "/login";

    static navigationOptions = {
        header: null,
    };
    constructor(props:Props){
        super(props);
        AsyncStorage.getItem("account").then((value) => {
            if (value){
                console.log('account is existed in asyncstorage')
                this.props.navigation.navigate('Main');
            }    
        })
    }
    SignInRequest = async ( email, password ) => {
        var response = await fetch(this.LoginRoutes, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'id': email,
                'password': password
            })
        });
        if (!response.ok) 
            Alert.alert("ID or Password was wrong.");
        else { 
            console.log(this.props.navigation);

            const setAccount = async (email) => {
                var result = await AsyncStorage.setItem('account', JSON.stringify({'email':email}));
                console.log('save account');
            }
            setAccount(email);
            this.props.navigation.navigate('Main');
        }

        console.log(response.status); 
    }

    onLogin() {
        const { email, password } = this.state;

        //Alert.alert('Credentials', `email: ${email} + password: ${password}`);
        const result = this.SignInRequest( email, password ); 
    }

    switchSignUp = async () => {
        this.props.navigation.navigate('SignUp');
    };

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
                    onPress={this.switchSignUp.bind(this)}
                >
                    <Text style={styles.buttonText}>간편 회원가입</Text>
                </TouchableOpacity>

            </View>
        );
    }
}

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
