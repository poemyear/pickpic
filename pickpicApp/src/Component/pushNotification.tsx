import { Platform } from "react-native";
import { Notifications } from 'expo'; 
import * as Permissions from 'expo-permissions'; 
import * as Constants from 'expo-constants'; 
import config from '../Component/config'; 

const PUSH_ENDPOINT = config.getConfig('serverAddress') + '/users';

async function registerForPushNotificationsAsync(id) {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  // Stop here if the user did not grant permissions
  /*if (finalStatus !== 'granted') {
    console.log( finalStatus ); 
    return;
  }*/

  // Get the token that uniquely identifies this device
  //alert('I\'m getting token, finalStatus : ' + finalStatus + ' existingStatus : ' + existingStatus);


  let token = await Notifications.getExpoPushTokenAsync();
  console.log(token);

  // POST the token to your backend server from where you can retrieve it to send push notifications.
  const pushAddress = PUSH_ENDPOINT+'/'+id; 
  console.log(pushAddress);
  return fetch(pushAddress, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: {
        value: token,
      },
    }),
  });
}
export default registerForPushNotificationsAsync; 