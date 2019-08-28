import React from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';
import { AppLoading } from "expo";
import * as Font from 'expo-font';

import AppNavigator from './src/Navigation/AppNavigator';
import Signin from './src/Scene/Signin';

interface Props {

}
interface States {
  theme: any,
  currentTheme: any,
  isReady: boolean
}


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
