import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import {Dimensions, StyleSheet, View, Text, Platform} from 'react-native';
import React from "react";
import SliderEntry from "../../Component/SliderEntry.js";

const { width: screenWidth } = Dimensions.get('window')
interface Props {
    data: {title:string, subtitle:string, illustration:string}[]
}
interface State {
    uri:String[]
}
export default class MyCarousel extends React.Component<Props, State>{

    constructor(props: Props)
    {
        super(props);
    }

    _renderItem ({item, index}, parallaxProps) {
        return (
            <View style={styles.item}>
            <ParallaxImage
                source={{ uri: item.illustration }}
                containerStyle={styles.imageContainer}
                style={styles.image}
                parallaxFactor={0.4}
                {...parallaxProps}
            />
            <Text style={styles.title}>{ item.title }</Text>

            </View> 
        );
    }

    render () {
        return (
            <Carousel
                sliderWidth={screenWidth}
                sliderHeight={screenWidth}
                itemWidth={screenWidth - 60}
                data={this.props.data}
                renderItem={this._renderItem}
                hasParallaxImages={true}
            />
        );
    }
}

const styles = StyleSheet.create({
    item: {
        width: screenWidth - 60,
        height: screenWidth - 60,
    },
    imageContainer: {
        flex: 1,
        marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
        backgroundColor: 'white',
        borderRadius: 8,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
    },
    title: {
        paddingHorizontal: 30,
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
    },
})
/*import react from 'react';
import { stylesheet, text, view } from 'react-native';
import { button, toast } from '@ant-design/react-native';
import { slider } from '@ant-design/react-native';

interface props {
    value: string;
}

interface states {

}

export default class home extends react.component<props, states> {
    constructor(props: props) {
        super(props);
    }

    render() {
        const {value}=this.props;
        return (<view>
            <text>{value}</text>
            <text>{value}</text>
            <text>{value}</text>
            <text>{value}</text>
            <text>{value}</text>
            <slider defaultvalue={0.5} />
            <button onpress={() => toast.info('toast test')}>
                start
            </button>
            <text>{value}</text>
        </view>);
    }
}*/
