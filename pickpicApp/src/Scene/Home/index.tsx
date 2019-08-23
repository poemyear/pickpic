import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import { Button, Dimensions, StyleSheet, View, Text, Platform } from 'react-native';
import React, { useRef, createRef } from 'react'
import SliderEntry from "../../Component/SliderEntry.js";
import Upload from "../Upload";

const { width: screenWidth } = Dimensions.get('window')
interface Props {
    // data: {title:string, subtitle:string, illustration:string}[]
}
interface State {
    eventIdx: number,
    events: {
        id: String,
        photos: {
            id: String,
            uri: String
        }[];
    }[];
}


export default class MyCarousel extends React.Component<Props, State>{
    carouselRef = createRef<Carousel>();
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events";

    constructor(props: Props) {
        super(props);
        this.state = {
            eventIdx: 0,
            events: []
        }
    }

    snapToNext = () => {
        this.carouselRef.current.snapToNext();
    }

    snapToPrev = () => {
        this.carouselRef.current.snapToPrev();
    }

    vote = async () => {
        const activeIdx = this.carouselRef.current._getActiveItem();
        const event = this.state.events[this.state.eventIdx];

        const eventId = event.id;
        const photoId = event.photos[activeIdx].id;

        const voteInfo = this.eventRoute + "/" + eventId + "/" + photoId;

        var response = await fetch(voteInfo, {
            method: 'post',
            body: JSON.stringify({
                'voter': 'bakyuns'
            })
        });

        console.log(response.status, ": vote for eventId: ", eventId, ", photoId: ", photoId);
        this.setState({ eventIdx: this.state.eventIdx + 1 });
    }


    fetchEvent = async () => {
        let responseJson = await (await fetch(this.eventRoute)).json();
        let events = [];
        for (let event of await responseJson) {
            events.push(await this.plotEvent(event._id));
        }
        return events;
    }

    plotEvent = async (eventId) => {
        let eventInfo = this.eventRoute + "/" + eventId;
        let responseJson = await (await fetch(eventInfo)).json();
        console.debug(eventId);

        let photos = [];
        for (let i = 0; i < responseJson.photos.length; i++) {
            const info = responseJson.photos[i];
            const photoId = info._id;
            const uri = this.serverAddress + "/" + info.path;
            photos.push({ id: photoId, uri });
        }
        return { id: eventId, photos };
    }

    // before render(), setting part 
    async componentWillMount() {
        console.log("componentDidMount Entrance");
        try {
            let events = await this.fetchEvent();
            this.setState({
                events
            });

            console.log(this.state);
        } catch (err) {
            console.error(err);
        }
    }

    _renderItem = ({ item, index }, parallaxProps) => {
        console.log("_renderItem Start")
        console.log(item);
        return (
            <View style={styles.item}>
                <ParallaxImage
                    source={{ uri: item.uri }}
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
        var data = [];
        if (this.state.events[this.state.eventIdx])
            data = this.state.events[this.state.eventIdx].photos;
        return (
            <View>
                <Carousel
                    ref={this.carouselRef}
                    sliderWidth={screenWidth}
                    sliderHeight={screenWidth}
                    itemWidth={screenWidth - 60}
                    data={data} //{this.state.events[this.state.eventIdx].photos}
                    renderItem={this._renderItem}
                    hasParallaxImages={true}
                />
                <Button
                    title={'Pick'}
                    onPress={this.vote} />
                <Button
                    title={'Next'}
                    onPress={this.snapToNext} />
                <Button
                    title={'Prev'}
                    onPress={this.snapToPrev} />
            </View>
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
