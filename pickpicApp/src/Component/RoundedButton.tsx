import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

interface Props {
    onPress?,
    title?: string,
    styleButton?: object,
    styleText?: object,
}
interface State {
}

export default class RoundedButton extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <TouchableOpacity
                style={[styles.button, this.props.styleButton]}
                onPress={this.props.onPress}
            >
                <Text style={[styles.text, this.props.styleText]}>{this.props.title}</Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: 'powderblue',
        width: 200,
        height: 44,
        padding: 10,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 25,
        marginBottom: 10,
    },
    text: {
        fontFamily: 'Baskerville',
        fontSize: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});