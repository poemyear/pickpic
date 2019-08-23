import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import { Dimensions, StyleSheet, View, Text, Platform } from 'react-native';
import React from "react";
import SliderEntry from "../../Component/SliderEntry.js";

const { width: screenWidth } = Dimensions.get('window')
interface Props {
    // data: {title:string, subtitle:string, illustration:string}[]
}
interface State {
    event: {
        id: String;
        uri: String[];
        filePath: String[];
    }
}
export default class MyCarousel extends React.Component<Props, State>{
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events";

    constructor(props: Props) {
        super(props);
        this.state = {
            event: {
                id: null,
                uri: [],
                filePath: []
            }
        }
    }

    fetchEvent = async () => {
        var responseJson = await (await fetch(this.eventRoute)).json();
        for (let event of responseJson) {
            // console.debug(responseJson);
        }
        return responseJson;
    }

    plotEvent = async (eventId) => {
        var eventInfo = this.eventRoute + "/" + eventId;
        var responseJson = await (await fetch(eventInfo)).json();
        
        var photos = responseJson.photos;
        var pathArray = new Array<string>();  // variable for saving photos-Path

        for (var i=0; i < photos.length; i++) {
            pathArray[i] = this.serverAddress + "/" + responseJson.photos[i].path;
            console.log("PathArray[" + i + "] = " + pathArray[i]);
        }

        this.setState({
            event: {
                id: eventId,
                filePath: pathArray,
                uri: []
            }
        }, () => {
            console.log("SetState Callback  " + this.state.event.filePath);
        });
    }

    // before render(), setting part 
    async componentWillMount() {
        console.log("componentDidMount Entrance");
        try {
            // var responseJson = ;
            for (let event of await this.fetchEvent()) {
                // console.debug(responseJson);
                const eventId = "5d5d6ea02b16eb5df033a363";
                this.plotEvent(eventId); // TODO: 받아온 event들 사진 다운로드해오기 
                break;
            }
        } catch (err) {
            console.error(err);
        }
    }

    _renderItem = ({ item, index }, parallaxProps) => {
        console.log("_renderItem Start")
        return (
            <View style={styles.item}>
                <ParallaxImage
                    source={{ uri: this.state.event.filePath[index] }}
                    containerStyle={styles.imageContainer}
                    style={styles.image}
                    parallaxFactor={0.4}
                    {...parallaxProps}
                />
                <Text style={styles.title}>{item.title}</Text>

            </View>
        );
    }

    render() {
        return (
            <Carousel
                sliderWidth={screenWidth}
                sliderHeight={screenWidth}
                itemWidth={screenWidth - 60}
                data={this.state.event.filePath}
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
