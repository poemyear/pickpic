import React from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';
import { AppLoading } from "expo";
import * as Font from 'expo-font';

import AppNavigator from './src/Navigation/AppNavigator';
import Signin from './src/Scene/Signin';
import * as firebase from "firebase/app";

interface Props {

}
interface States {
  theme: any,
  currentTheme: any,
  isReady: boolean
}
var firebaseConfig = {
  apiKey: "api-key",
  authDomain: "project-id.firebaseapp.com",
  databaseURL: "https://project-id.firebaseio.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "sender-id",
};
const messaging = firebase.messaging();
messaging.usePublicVapidKey("BB2WHGVFfFk98kYbLyIAhO6qPzqiD_hhqx0vs9ZHMAz8Qoz2FsJ8g7M1KXugq2kbMsMhyoyyEi2N-gtUk7Z9ONg");
Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    console.log('Notification permission granted.');
    // TODO(developer): Retrieve an Instance ID token for use with FCM.
    // ...
  } else {
    console.log('Unable to get permission to notify.');
  }
});
messaging.getToken().then((currentToken) => {
  if (currentToken) {
    console.log(currentToken);
    ////endTokenToServer(currentToken);
    ////updateUIForPushEnabled(currentToken);
  } else {
    // Show permission request.
    console.log('No Instance ID token available. Request permission to generate one.');
    // Show permission UI.
    ////updateUIForPushPermissionRequired();
    ////setTokenSentToServer(false);
  }
}).catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
  //showToken('Error retrieving Instance ID token. ', err);
  //setTokenSentToServer(false);
});
messaging.onTokenRefresh(() => {
  messaging.getToken().then((refreshedToken) => {
    console.log('Token refreshed.');
    // Indicate that the new Instance ID token has not yet been sent to the
    // app server.
    ////setTokenSentToServer(false);
    // Send Instance ID token to app server.
    ////sendTokenToServer(refreshedToken);
    // ...
  }).catch((err) => {
    console.log('Unable to retrieve refreshed token ', err);
    ////showToken('Unable to retrieve refreshed token ', err);
  });
});

export default class App extends React.Component<Props, States> {
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
      return <AppLoading />;
    }
    return <AppNavigator/>;
  }
}