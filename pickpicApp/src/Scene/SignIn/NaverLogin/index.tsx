import React, {Component} from 'react';
import { View, Text, Platform, StyleSheet, Button, WebView } from 'react-native'
import { StackActions, NavigationActions } from 'react-navigation';

interface Props {
    navigation:any;
}
interface State {
    url:any;
}
export default class NaverLogin extends React.Component<Props,State> {
    webview:any;

    componentWillMount(){
        this.setState({
            url:this.props.navigation.getParam("uri")
        });
    }

    webViewEnd = async(event) => {
        const result = JSON.parse(event.nativeEvent.data);
        console.log("result",result);
        if(result.statusCodeValue === 200) {
            //성공적 네이버 로그인/회원가입 완료
            //login 정보 저장 하기!
            const data = {
                token:"",
                nickName:"",
                profile:""
            }
            console.log("data = ",data);
            await this.props.navigation.getParam("login")(data);
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Setting' })],
            });
            this.props.navigation.dispatch(resetAction);
        }else{
            //실패..
            this.props.navigation.goBack();
        }

    }

    render(){
        const uri = this.props.navigation.getParam("uri");
        console.log("[WebLogin] uri = ",this.state.url);

        return(
            <View style={styles.container}>
            <WebView
                ref={ref=> (this.webview = ref)}
                source={{uri:this.state.url}}
                useWebKit={true} 
                onMessage={(event)=>this.webViewEnd(event)}
            />
            </View>

        )
    }
  }

  const styles = StyleSheet.create({
      container:{
          flex:1,
      }
  })