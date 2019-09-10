import { Platform } from "react-native";
import { Constants, Notifications, Permissions } from 'expo';

export const push = {
  _registerForBackendAppConfig : async (user_id) => {
    const { status : existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    ); 

    let finalStatus = existingStatus;
    console.log("finalStatus", finalStatus);
    if( existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    let pushToken = await Notifications.getExpoPushTokenAsync();

    console.log('pushToken', pushToken); 
    let appVersion = Constants.manifest.version;
    let deviceOS = Platform.OS;
    let pushYn = 'Y';

    console.log("== Push Token 권한 데이터 획득 완료, App 설정정보 전송API호출 == ")
    
    const appData = {
      user_id : user_id,
      push_token : pushToken,
      push_yn : pushYn,
      device_os : deviceOS,
      app_version:appVersion
    }
    console.log(appData);
  }
}
