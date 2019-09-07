import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import { Button, Dimensions, StyleSheet, Image, View, Text, Platform, Animated } from 'react-native';
import React, { createRef } from 'react'
import moment from 'moment';
import { NavigationEvents } from 'react-navigation';

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
    }[],
    like:boolean,
}


export default class Pick extends React.Component<Props, State>{
    carouselRef = createRef<Carousel>();
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events";
    // userId = "bakyuns";
    userId = "randomId-" + Math.floor(Math.random() * 10);  // TODO: use signed in user's _id  

    constructor(props: Props) {
        super(props);
        this.state = {
            eventIdx: -1,
            events: [],
            like:false,
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
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'voter': this.userId
            })
        });

        console.log(response.status, ": ", voteInfo);

        this.carouselRef.current.snapToItem(0);

        try {
            if (this.state.eventIdx + 1 >= this.state.events.length) {
                const events = await this.fetchEvents();
                this.setState({
                    eventIdx: events.length > 0 ? 0 : -1,
                    events: events,
                    like:false,
                });
            } else {
                this.setState({
                    eventIdx: this.state.eventIdx + 1,
                    like:false,
                })
            }
        } catch (err) {
            console.error(err);
        }
    }

    fetchEvents = async () => {
        console.debug("fetch Events");
        let response = await fetch(this.eventRoute, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
                "userid": this.userId
            }
        });
        if (!response.ok)
            console.error("Request Failed");
        let responseJson = await response.json();
        let events = [];
        for (let event of responseJson) {
            events.push(await this.parseEvent(event._id));
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

    heartOpacity = new Animated.Value(0);

    likeAndVote = () => {
        if (!this.state.like) {
            this.setState(()=> {
                Animated.sequence([
                    Animated.spring(this.heartOpacity, { toValue: 1, useNativeDriver: true, tension: 50, delay:0 }),
                    Animated.spring(this.heartOpacity, { toValue: 0, useNativeDriver: true, tension: 100, delay:0 }),
                ]).start(this.vote);
                return {like:true};
            });
        }
    }

    get renderOverlayHeart() {
        return (
            <View style={styles.overlay}>
                <Animated.Image
                    source={require('../../Component/heart.png')}
                    style={[
                        styles.overlayHeart, 
                        {
                            opacity: this.heartOpacity,
                            transform: [{
                                    scale: this.heartOpacity.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.5, 1],
                                    }),
                                },],
                        },]}
                />
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
                <NavigationEvents
                    onWillFocus={()=>this.fetchEvents}
                />
                <Text style={styles.title}>Current UserId: {this.userId}</Text>
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
                {this.renderOverlayHeart}
                <Button
                    title={'Pick'}
                    onPress={this.likeAndVote} />
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
    overlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        left: screenWidth/2,
        right: screenWidth/2,
        top: screenWidth/2,
        bottom: screenWidth/2,
    },
    overlayHeart: {
        tintColor: '#fff',
    },
})