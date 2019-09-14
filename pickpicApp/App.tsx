import React from 'react';
import { Platform } from "react-native";
import { Button, Image, StyleSheet, Text, View, PermissionsAndroid } from 'react-native';
import { AppLoading, Constants, Notifications, Permissions } from "expo";
import * as Font from 'expo-font';

import AppNavigator from './src/Navigation/AppNavigator';
import Signin from './src/Scene/Signin';
import registerForPushNotificationsAsync from './src/Component/pushNotification';

interface Props {

}
interface States {
  theme: any, 
  currentTheme: any,
  isReady: boolean
}
export default class App extends React.Component<Props, States> {
  notificationListener:Function;
  notificationOpenedListener:Function;

  constructor(props: Props) {
    super(props);
    console.log(props);
    this.state = {
      theme: null,
      currentTheme: null,
      isReady: false
    }
  }

  changeTheme = (theme, currentTheme) => {
    this.setState({ theme, currentTheme });
  };

  async componentDidMount() {
    await Font.loadAsync(
      'antoutline',
      // eslint-disable-next-line
      require('@ant-design/icons-react-native/fonts/antoutline.ttf')
    );

    await Font.loadAsync(
      'antfill',
      // eslint-disable-next-line
      require('@ant-design/icons-react-native/fonts/antfill.ttf')
    );
    // eslint-disable-next-line
    this.setState({ isReady: true });
  }

  render() {
    const { theme, currentTheme, isReady } = this.state;
    if (!isReady) {
      return (<View></View>);
    }
    return <AppNavigator/>;
  }
}