import React from 'react';
import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import MainTabNavigator from './MainTabNavigator';
import SignIn from '../Scene/SignIn'
import SignUp from '../Scene/SignUp'
import NaverLogin from '../Scene/SignIn/NaverLogin'

const SignNavi= createStackNavigator({ SingIn: SignIn, SignUp: SignUp, NaverLogin: NaverLogin});
const AppNavi = createSwitchNavigator({ Main: MainTabNavigator, });


export default createAppContainer(
  createSwitchNavigator(
    {
      SignNavi: SignNavi,
      AppNavi: AppNavi
    },
    {
      initialRouteName: 'SignNavi',
    }
  )
);
