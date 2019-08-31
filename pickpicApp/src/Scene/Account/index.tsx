import React, { Component } from 'react';
import { Alert, Button, Text, TouchableOpacity, TextInput, View, StyleSheet } from 'react-native';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
} from 'react-native';
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';
import ToggleSwitch from 'toggle-switch-react-native'
import SignUp from './../Signup'

interface Props {
    navigation: any
}
interface State {
    email: string,
    pushStatus: boolean
}

export default class SignIn extends React.Component<Props, State> {
    state = {
        email: '',
        password: '',
        pushStatus: true 
    };
    serverAddress = "http://localhost:3000";
    userPatchAddress = this.serverAddress + "/users";

    static navigationOptions = {
        header: null,
    };

    constructor(props:Props)
    {
        super(props);
        AsyncStorage.getItem("account").then((account) => {
            if (account){
                this.setState({email:JSON.parse(account).email})
            }    
        })
    }
    logout = async () => {
        console.log('logout');
        AsyncStorage.removeItem("account");
        this.props.navigation.navigate('SingIn');
        
    }

    changePushStatus = async (isOn) =>  {
        var response = await fetch(this.userPatchAddress, {
            method: 'patch',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'id': this.state.email,
                'pushStatus': isOn,
            })
        }
        )
    }
    
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.ID}>ID: {this.state.email}</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={this.logout}
                >
                    <Text style={styles.logout}>로그아웃</Text>
                </TouchableOpacity>
                <ToggleSwitch
                    isOn={this.state.pushStatus}
                    onColor="green"
                    offColor="grey"
                    label="푸시 알림 받기"
                    labelStyle={{ color: "black", fontWeight: "900" }}
                    size="small"
                    onToggle={isOn => {
                        this.setState({pushStatus:isOn})
                        this.changePushStatus(isOn)
                    }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ID : {
        //fontFamily: 'Baskerville',
        fontSize: 10,
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
    logout: {
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
