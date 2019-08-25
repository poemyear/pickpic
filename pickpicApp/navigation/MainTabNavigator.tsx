import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import PickScreen from '../src/Scene/Pick';
import UploadScreen from '../src/Scene/Upload';

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

// UploadStack.path = '';

const UserStack = createStackNavigator(
  {
    Pick: PickScreen,
  },
  // config
);

UserStack.navigationOptions = {
  tabBarLabel: 'User',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'} />
  ),
};

// UserStack.path = '';

const tabNavigator = createBottomTabNavigator({
  PickStack: PickStack,
  UploadStack: UploadStack,
  UserStack: UserStack,
});

// tabNavigator.path = '';

export default tabNavigator;
