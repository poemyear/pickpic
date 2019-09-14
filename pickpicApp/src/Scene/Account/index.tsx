import React, { Component, createContext } from 'react';
import {  Text, View, StyleSheet } from 'react-native';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
} from 'react-native';

import { createStackNavigator, createSwitchNavigator, createAppContainer, NavigationEvents } from 'react-navigation';
import ToggleSwitch from 'toggle-switch-react-native'
import SignUp from './../Signup'
import { getPlatformOrientationLockAsync } from 'expo/build/ScreenOrientation/ScreenOrientation';
import config from '../../Component/config';
import RoundedButton from '../../Component/RoundedButton';

interface Props {
    navigation: any
}
interface State {
    email: string,
    point: Number,
    pushStatus: boolean
}

export default class Account extends React.Component<Props, State> {
    state: State = {
        email: '',
        point: 0,
        pushStatus: true
    };
    userId = "";
    pointHandler;
    serverAddress = config.getConfig('serverAddress');
    getUserAddress = this.serverAddress + "/users";
    userPatchAddress = this.serverAddress + "/users";
    userInfoParam = "id,point,pushStatus";

    static navigationOptions = {
        header: null,
    };

    readUserId = async () => {
       const account = await AsyncStorage.getItem("account");
       return JSON.parse(account).email;
    }

    constructor(props: Props) {
        super(props);
        AsyncStorage.getItem("account").then(
            (account) => {
                if (account) {
                    this.userId = JSON.parse(account).email;
                    this.updateUserInfo(this.userId);
                }
            });
    }

    updateUserInfo = (userId:string = this.state.email) => {
        this.getUserInfo(userId).then((userInfo) => {
            const point = userInfo.point;
            const pushStatus = userInfo.pushStatus;
            this.setState({email:userId, point, pushStatus});
            AsyncStorage.setItem('point', JSON.stringify({ point }));
        })
    }

    async getUserInfo(userId:string) {
        return await (await fetch(this.getUserAddress + '/' + userId + '?param=' + this.userInfoParam, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })).json();
    }

    // async getPoint() {
    //     //var pointResp:IgetPointResponse<Number>;
    //     var pointResp = await (await fetch(this.getUserAddress + '/' + this.state.email + '?param=point', {
    //         method: 'get',
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         }
    //     })).json();
    //     if (pointResp.hasOwnProperty('point')) {
    //         return pointResp.point;
    //     }
    //     else {
    //         return 0;
    //     }
    // }

    // pointOnChange = async () => {
    //     var point = await AsyncStorage.getItem("point");
    //     console.log('point : ' + point);
    //     if (point && JSON.parse(point).point != this.state.point) {
    //         try {
    //             const curPoint = await this.getPoint();
    //             AsyncStorage.setItem('point', JSON.stringify({ 'point': curPoint }));
    //             this.setState({point:curPoint});
    //         }
    //         catch (err) {
    //             console.error(err);
    //         }
    //     }
    // }

    componentDidMount() {
        this.pointHandler = setInterval(
            this.updateUserInfo,
            10000
        );
    }

    componentWillUnmount() {
        clearInterval(this.pointHandler);
    }

    logout = async () => {
        console.log('logout');
        AsyncStorage.removeItem("account");
        AsyncStorage.removeItem("point");
        this.props.navigation.navigate('SingIn');
    }

    changePushStatus = async (isOn) => {
        var response = await fetch(this.userPatchAddress, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'pushStatus': isOn,
            })
        }
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <NavigationEvents
                    onWillFocus={()=>this.updateUserInfo()}
                />
                <Text style={styles.ID}>ID: {this.state.email}</Text>
                <Text style={styles.ID}>Point: {this.state.point}</Text>
                <RoundedButton
                    styleButton={styles.button}
                    onPress={this.logout}
                    title='로그아웃'
                    styleText={styles.logout}
                />
                <ToggleSwitch
                    isOn={this.state.pushStatus}
                    onColor="green"
                    offColor="grey"
                    label="푸시 알림 받기"
                    labelStyle={{ color: "black", fontWeight: "900" }}
                    size="small"
                    onToggle={isOn => {
                        this.setState({ pushStatus: isOn })
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
    ID: {
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
