import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import { Button, Dimensions, StyleSheet, View, Text, Platform } from 'react-native';
import React, { useRef, createRef } from 'react'
import moment from 'moment';

const { width: screenWidth } = Dimensions.get('window')

interface Props {

}
interface State {
    eventIdx: number,
    events: {
        id: string,
        title: string,
        expiredAt: Date,
        photos: {
            id: string,
            uri: string
        }[];
    }[];
}


export default class Pick extends React.Component<Props, State>{
    carouselRef = createRef<Carousel>();
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events";

    constructor(props: Props) {
        super(props);
        this.state = {
            eventIdx: -1,
            events: []
        }
        console.debug('Pick constructor');
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
        const voteInfo = this.eventRoute + "/" + event.id + "/" + event.photos[activeIdx].id;
        var response = await fetch(voteInfo, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'voter': 'bakyuns'
            })
        });

        console.log(response.status, ": ", voteInfo);

        this.carouselRef.current.snapToItem(0);

        try {
            if (this.state.eventIdx + 1 >= this.state.events.length) {
                const events = await this.fetchEvents();
                this.setState({
                    eventIdx: events.length > 0 ? 0 : -1,
                    events: events
                });
            } else {
                this.setState({
                    eventIdx: this.state.eventIdx + 1
                })
            }
        } catch (err) {
            console.error(err);
        }
    }

    fetchEvents = async () => {
        console.debug("fetch Events");
        let responseJson = await (await fetch(this.eventRoute)).json();
        let events = [];
        for (let event of responseJson) {
            events.push(await this.parseEvent(event._id));
        }
        if (events.length == 0) {
            alert("새로운 투표가 없습니다.")
        }
        return events;
    }

    parseEvent = async (eventId) => {
        let eventInfo = this.eventRoute + "/" + eventId;
        let responseJson = await (await fetch(eventInfo)).json();
        console.debug(eventId);

        let photos = [];
        const title = responseJson.title;
        const expiredAt = new Date(responseJson.expiredAt);
        
        for (let i = 0; i < responseJson.photos.length; i++) {
            const info = responseJson.photos[i];
            const photoId = info._id;
            const uri = this.serverAddress + "/" + info.path;
            photos.push({ id: photoId, uri });
        }
        return { id: eventId, title, expiredAt, photos };
    }

    async componentDidMount() {
        console.log("componentDidMount Entrance");
        try {
            const events = await this.fetchEvents();
            this.setState({
                eventIdx: events.length > 0 ? 0 : -1,
                events: events
            });
        } catch (err) {
            console.error(err);
        }
    }

    _renderItem = ({ item, index }, parallaxProps) => {
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
        let event = { id: '', title: '', photos: [], expiredAt: null };
        if (this.state.eventIdx >= 0) {
            event = this.state.events[this.state.eventIdx];
        }
        return (
            <View>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.title}>Expired {moment(event.expiredAt).fromNow()}</Text>
                <Carousel
                    ref={this.carouselRef}
                    sliderWidth={screenWidth}
                    sliderHeight={screenWidth}
                    itemWidth={screenWidth - 60}
                    data={event.photos}
                    renderItem={this._renderItem}
                    hasParallaxImages={true}
                />
                <Button
                    title={'Pick'}
                    onPress={this.vote} />
                <Button
                    title={'Fetch'}
                    onPress={this.fetchEvents} />
                {/* <Button
                    title={'Next'}
                    onPress={this.snapToNext} />
                <Button
                    title={'Prev'}
                    onPress={this.snapToPrev} /> */}
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
        // color: 'rgba(255, 255, 255, 0.9)',
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
