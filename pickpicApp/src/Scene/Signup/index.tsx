import React, { Component } from 'react';
import { Alert, Button, Text, TouchableOpacity, TextInput, StatusBar, View, StyleSheet } from 'react-native';
import t from 'tcomb-form-native';
import { TextField } from 'react-native-material-textfield';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { RaisedTextButton } from 'react-native-material-buttons';
import { any } from 'prop-types';

interface State {
  errors?: any;
  emailRef?: any;
  secureTextEntry?: any;
  [x: string]: any;
}
interface Props {
  emailRef: any
  navigation:any
}

export default class SignUp extends React.Component<Props, State> {
  emailRef: any;
  passwordRef: any;
  password: any;
  serverAddress = "http://localhost:3000";
  createUserRoute = this.serverAddress + "/users";

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
    ['email', 'password']
      .map((name) => ({ name, ref: this[name] }))
      .forEach(({ name, ref }) => {
        if (ref.isFocused()) {
          this.setState({ [name]: text });
        }
      });
  }
  SignUpRequest = async (email, password) => {
    console.log(email, password);
    var response = await fetch(this.createUserRoute, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'id': email,
        'password': password
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
      this.props.navigation.navigate('SignIn');
    }
  }
  onSubmit() {
    let errors = {};

    ['email', 'password']
      .forEach((name) => {
        let value = this[name].value();

        if (!value) {
          errors[name] = 'Should not be empty';
        } else {
          if ('password' === name && value.length < 6) {
            errors[name] = 'Too short';
          }
        }
      });

    this.setState({ errors });
    if (!Object.keys(errors).length) {
      console.log('There are no errors');
      this.SignUpRequest(this['email'].value(), this['password'].value());

    }
  }
  constructor(props) {
    super(props);
    this.onFocus = this.onFocus.bind(this);
    this.emailRef = this.updateRef.bind(this, 'email');
    this.onSubmitEmail = this.onSubmitEmail.bind(this);
    this.onSubmitPassword = this.onSubmitPassword.bind(this);
    this.passwordRef = this.updateRef.bind(this, 'password');
    this.renderPasswordAccessory = this.renderPasswordAccessory.bind(this);
    this.onAccessoryPress = this.onAccessoryPress.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeText = this.onChangeText.bind(this);

    this.state = {
      firstname: 'Eddard',
      lastname: 'Stark',
      about: 'Stoic, dutiful, and honorable man, considered to embody the values of the North',
      secureTextEntry: true,
    };
  }
  static navigationOptions = {
    title: 'Lots of features here',
  };
  render() {
    let { errors = {}, secureTextEntry, ...data } = this.state;
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
          label='Email Address'
          error={errors.email}
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
          label='Password'
          error={errors.password}
          title='Choose wisely'
          maxLength={30}
          characterRestriction={20}
          renderAccessory={this.renderPasswordAccessory}
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
});