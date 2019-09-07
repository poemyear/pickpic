import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../Component/TabBarIcon';
import PickScreen from '../Scene/Pick';
import UploadScreen from '../Scene/Upload';
import ResultScreen from '../Scene/CheckResult';
import DetailScreen from '../Scene/ResultDetail';
import AccountScreen from '../Scene/Account';

const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {},
});

const PickStack = createStackNavigator(
  {
    Pick: PickScreen,
  },
);

PickStack.navigationOptions = {
  tabBarLabel: 'Pick',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

// PickStack.path = '';

const UploadStack = createStackNavigator(
  {
    Upload: UploadScreen,
  },
  // config
);

UploadStack.navigationOptions = {
  tabBarLabel: 'Upload',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'} />
  ),
};

const ResultStack = createStackNavigator(
  {
    Result: ResultScreen,
    Detail: DetailScreen,
  },
  // config
);

ResultStack.navigationOptions = {
  tabBarLabel: 'Result',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'} />
  ),
};

const AccountStack= createStackNavigator(
  {
    Account: AccountScreen,
  },
  // config
);

AccountStack.navigationOptions = {
  tabBarLabel: 'Account',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'} />
  ),
};
const tabNavigator = createBottomTabNavigator({
  PickStack: PickStack,
  UploadStack: UploadStack,
  ResultStack: ResultStack,
  AccountStack: AccountStack
});

// tabNavigator.path = '';

export default tabNavigator;
