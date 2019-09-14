import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import { AsyncStorage, Button, Dimensions, StyleSheet, Image, View, Text, Platform, Animated } from 'react-native';
import React, { createRef } from 'react'
import moment from 'moment';
import { NavigationEvents } from 'react-navigation';
// import registerForPushNotificationsAsync from '../../Component/pushNotification';
import config from '../../Component/config';
import { getPermissionLabelByValue } from '../../Component/GenderPermission';
import DetailButton from '../../Component/DetailButton';
import RoundedButton from '../../Component/RoundedButton';

const { width: screenWidth } = Dimensions.get('window')

interface Props {

}
interface State {
    eventIdx: number,
    events: {
        id: string,
        title: string,
        expiredAt: Date,
        genderPermission: string,
        photos: {
            id: string,
            uri: string
        }[];
    }[],
    email: string,
    like: boolean,
}


export default class Pick extends React.Component<Props, State>{
    carouselRef = createRef<Carousel>();
    serverAddress = config.getConfig('serverAddress');
    eventRoute = this.serverAddress + "/events";
    // userId = "bakyuns";
    userId = "randomId-" + Math.floor(Math.random() * 10);  // TODO: use signed in user's _id  

    constructor(props: Props) {
        super(props);
        this.state = {
            eventIdx: -1,
            events: [],
            like: false,
            email: ''
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
                    like: false,
                });
            } else {
                this.setState({
                    eventIdx: this.state.eventIdx + 1,
                    like: false,
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
        const genderPermission = responseJson.genderPermission;

        for (let i = 0; i < responseJson.photos.length; i++) {
            const info = responseJson.photos[i];
            const photoId = info._id;
            const uri = this.serverAddress + "/" + info.path;
            photos.push({ id: photoId, uri });
        }
        return { id: eventId, title, expiredAt, genderPermission, photos };
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
        AsyncStorage.getItem("account").then((account) => {
            if (account){
                this.setState({email:JSON.parse(account).email})
                // registerForPushNotificationsAsync(this.state.email);
            }    
        });
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
            this.setState(() => {
                Animated.sequence([
                    Animated.spring(this.heartOpacity, { toValue: 1, useNativeDriver: true, tension: 50, delay: 0 }),
                    Animated.spring(this.heartOpacity, { toValue: 0, useNativeDriver: true, tension: 100, delay: 0 }),
                ]).start(this.vote);
                return { like: true };
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
        let event = { id: '', title: '', photos: [], genderPermission: '', expiredAt: null };
        if (this.state.eventIdx >= 0) {
            event = this.state.events[this.state.eventIdx];
        }
        return (
            <View style={{ flex: 1 }}>
                <Text style={styles.text}>Current UserId: {this.userId}</Text>
                <NavigationEvents
                    onWillFocus={() => this.fetchEvents}
                />
                <View style={{ flex: 1, marginTop: 20 }}>
                    <Text style={styles.title}> {event.title} </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.text, { flex: 3 }]}>Expired {moment(event.expiredAt).fromNow()}</Text>
                        <Text style={styles.text}>{getPermissionLabelByValue(event.genderPermission)}</Text>
                        <View style={{ flex: 1, alignItems: 'flex-end', paddingHorizontal: 15 }}>
                            <DetailButton onPress={() => { }} />
                        </View>
                    </View>
                </View>
                <View style={{ height: screenWidth }}>
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
                </View>
                <View style={{ flex: 1, alignItems: 'center', marginTop: 20 }}>
                    <RoundedButton
                        title='Pick'
                        onPress={this.likeAndVote}
                        styleButton={{ backgroundColor: 'rgba(20, 115, 250, 0.5)' }}
                        styleText={{ fontWeight: 'bold', fontFamily: "Georgia", color: 'white' }}
                    />
                </View>
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
        // paddingHorizontal: 30,
        // backgroundColor: 'transparent',
        // color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    text: {
        margin: 10,
        fontSize: 14,
        textAlign: 'right'
    },
    overlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        left: screenWidth / 2,
        right: screenWidth / 2,
        top: screenWidth / 2,
        bottom: screenWidth / 2,
    },
    overlayHeart: {
        tintColor: '#fff',
    },
})