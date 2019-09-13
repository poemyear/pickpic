import React, { Component } from 'react';
import {
    Image, 
    View,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

interface Props {
    onPress,
}
interface State {
}

export default class DetailButton extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
                <View>
                <TouchableOpacity activeOpacity={1} onPress={this.props.onPress}>
                    <Image source={require('./kebab_button.png')}/>
                </TouchableOpacity>
                </View>

        );
    }
}

const styles = StyleSheet.create({
  });