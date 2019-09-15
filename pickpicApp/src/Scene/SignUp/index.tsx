import React, { Component } from 'react';
import { Alert, Button, Text, TouchableOpacity, TextInput, StatusBar, View, StyleSheet } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { RaisedTextButton } from 'react-native-material-buttons';
import { NavigationActions } from 'react-navigation'
import config from '../../Component/config';
import Sha256 from '../../Component/Sha256'
import DatePicker from 'react-native-datepicker'
import { SegmentedControls } from 'react-native-radio-buttons'

interface State {
  errors?: any;
  emailRef?: any;
  secureTextEntry?: any;
  dupCheck: Boolean;
  sex: String; 
  birthday: String; 
  [x: string]: any;
}
interface Props {
  emailRef: any
  navigation:any
}

export default class SignUp extends React.Component<Props, State> {
  emailRef: any;
  passwordRef: any;
  passwordVerifyRef: any;
  nicknameRef: any;
  password: any;
  serverAddress = config.getConfig('serverAddress');
  createUserRoute = this.serverAddress + "/users";
  dupCheckRoute = this.serverAddress + "/users";

  updateRef(name, ref) {
    this[name] = ref;
  }
  onFocus() {
    let { errors = {} } = this.state;

    for (let name in errors) {
      let ref = this[name];

      if (ref && ref.isFocused()) {
        delete errors[name];
      }
    }

    this.setState({ errors });
  }
  onAccessoryPress() {
    this.setState(({ secureTextEntry }) => ({ secureTextEntry: !secureTextEntry }));
  }
  onSubmitEmail() {
    this.password.focus();
  }
  onSubmitPassword() {
    this.password.blur();
  }
  dupCheck = async() => {
    console.log("dupCheck");
    var response = await fetch(this.dupCheckRoute+'/'+this.state['email']+'?dupCheck=1', { 
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json(); 
    if ( result['resp'] != undefined  ) {
      this.setState({dupCheck:!result['resp']});

      if( result['resp'] )
        alert('중복된 아이디입니다.'); 
      else
        alert('사용 가능한 아이디입니다.'); 
    } 
  }

  renderEmailAccessory() {
    return (
      <RaisedTextButton onPress={this.dupCheck} title='중복체크' color={TextField.defaultProps.tintColor} titleColor='white' />
    );
  }

  renderPasswordAccessory() {
    let { secureTextEntry } = this.state;

    let name = secureTextEntry ?
      'visibility' :
      'visibility-off';

    return (
      <MaterialIcon
        size={24}
        name={name}
        color={TextField.defaultProps.baseColor}
        onPress={this.onAccessoryPress}
        suppressHighlighting
      />
    );
  }

  onChangeText(text) {
    ['email', 'password', 'password_verify', 'nickname']
      .map((name) => ({ name, ref: this[name] }))
      .forEach(({ name, ref }) => {
        if (ref.isFocused()) {
          this.setState({ [name]: text });
        }
      });
  }

  SignUpRequest = async () => {
    console.log('SignUpRequest');
    console.log(this.state); 
    const email = this.state['email'];
    const password = this.state['password']; 
    const nickname = this.state['nickname']; 
    const sex = this.state.sex;
    const birthday = this.state.birthday; 

    console.log(email, password, nickname, sex, birthday);
    var response = await fetch(this.createUserRoute, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'id': email.toLowerCase(),
        'password': Sha256(password),
        nickname,
        sex,
        birthday
      })
    });
    
    if (!response.ok) {
      return response.json().catch(err => {
        Alert.alert(response.statusText);
      }).then(json => {
        Alert.alert(json.error);
      });
    }
    else { 
      Alert.alert('회원가입이 완료되었습니다.');
      console.log(this.props.navigation);
      this.props.navigation.dispatch(NavigationActions.back());
    }
  }
  setSex(sex) {
    this.setState({
      sex
    });
  }
  onSubmit() {
    let errors = {};

    ['email', 'password', 'password_verify', 'nickname']
      .forEach((name) => {
        let value = this[name].value();

        if ( name == 'email' && !this.state.dupCheck){
          errors[name] = '아이디 중복체크 해주세요.'; 
        } else if (!value) {
          errors[name] = '필수로 채워주셔야 합니다.';
        } else {
          if ('password' === name && value.length < 6) {
            errors[name] = '패스워드가 너무 짧습니다.';
          }
          else if( 'password_verify' === name && this['password'].value() != value )
          {
            console.log( 'password verify' ); 
            console.log( this['password'].value() );
            console.log( value ); 
            errors[name] = '패스워드가 서로 다릅니다.';
          }
        }
      });

    this.setState({ errors });
    if (!Object.keys(errors).length) {
      console.log('There are no errors');
      this.SignUpRequest();

    }
  }
  constructor(props) {
    super(props);
    this.onFocus = this.onFocus.bind(this);
    this.emailRef = this.updateRef.bind(this, 'email');
    this.nicknameRef= this.updateRef.bind(this, 'nickname');
    this.onSubmitEmail = this.onSubmitEmail.bind(this);
    this.onSubmitPassword = this.onSubmitPassword.bind(this);
    this.passwordRef = this.updateRef.bind(this, 'password');
    this.passwordVerifyRef = this.updateRef.bind(this, 'password_verify');
    this.renderPasswordAccessory = this.renderPasswordAccessory.bind(this);
    this.renderEmailAccessory = this.renderEmailAccessory.bind(this);
    this.onAccessoryPress = this.onAccessoryPress.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    //this.dupCheck = this.dupCheck.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.setSex = this.setSex.bind(this); 

    this.state = {
      secureTextEntry: true,
      dupCheck : false,
      sex : '남자',
      birthday : '2019-01-01'
    };
  }
  static navigationOptions = {
    title: 'Lots of features here',
  };
  render() {
    let { errors = {}, secureTextEntry, ...data } = this.state;
    const options = [
      "남자",
      "여자"
    ];

        return (
      <View style={styles.container}>
        <StatusBar barStyle="default" />

            <TextField
              ref={this.emailRef}
              value={data.email}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
              enablesReturnKeyAutomatically={true}
              onChangeText={this.onChangeText}
              onFocus={this.onFocus}
              returnKeyType='next'
              label='Email 주소'
              error={errors.email}
              renderAccessory={this.renderEmailAccessory}
            />
        <TextField
          ref={this.passwordRef}
          value={data.password}
          secureTextEntry={secureTextEntry}
          autoCapitalize='none'
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          clearTextOnFocus={true}
          onFocus={this.onFocus}
          onSubmitEditing={this.onSubmitPassword}
          onChangeText={this.onChangeText}
          returnKeyType='done'
          label='암호'
          error={errors.password}
          title='6글자 이상을 입력해주세요.'
          maxLength={30}
          characterRestriction={20}
          renderAccessory={this.renderPasswordAccessory}
        />
        
        <TextField
          ref={this.passwordVerifyRef}
          value={data.password_verify}
          secureTextEntry={secureTextEntry}
          autoCapitalize='none'
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          clearTextOnFocus={true}
          onFocus={this.onFocus}
          onSubmitEditing={this.onSubmitPassword}
          onChangeText={this.onChangeText}
          returnKeyType='done'
          label='암호 재확인'
          error={errors.password_verify}
          title=''
          maxLength={30}
          characterRestriction={20}
          renderAccessory={this.renderPasswordAccessory}
        />
      
        <TextField
          ref={this.nicknameRef}
          value={data.nickname}
          autoCapitalize='none'
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          onChangeText={this.onChangeText}
          onFocus={this.onFocus}
          returnKeyType='next'
          label='닉네임'
          error={errors.nickname}
        />

        <Text style={{paddingBottom: 10, fontWeight:'bold'}}>성별</Text>
        <SegmentedControls
          options={ options }
          onSelection={ this.setSex.bind(this) }
          selectedOption={ this.state.sex }
        />

        <Text style={{paddingBottom: 10, fontWeight:'bold'}}>생년월일</Text>
        <DatePicker
          style={{width: 200}}
          date={this.state.birthday}
          mode="date"
          placeholder="생년월일 선택"
          format="YYYY-MM-DD"
          minDate="1960-01-01"
          maxDate="2020-01-01"
          confirmBtnText="완료"
          cancelBtnText="취소"
          customStyles={{
            dateIcon: {
              position: 'absolute',
              left: 0,
              top: 4,
              marginLeft: 0
            },
            dateInput: {
              marginLeft: 36
            }
            // ... You can check the source to find the other keys.
          }}
          onDateChange={(birthday) => {this.setState({birthday: birthday})}}
        />
        
        <RaisedTextButton onPress={this.onSubmit} title='submit' color={TextField.defaultProps.tintColor} titleColor='white' />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  email: {
    flex:1
  },
  duplicateCheck: {
    flex:1
  }
});