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
        photo_ID: String,
        filePath: String,
        count: number
    }[];
}


export default class CheckResult extends React.Component<Props, State>{
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events";

    constructor(props: Props) {
        super(props);
        this.state = {
            eventIdx: 0,
            events: []
        }
    }

    fetchEvent = async () => {
        let responseJson = await (await fetch(this.eventRoute)).json();
        let events = [];
        events.push(await this.plotEvent(responseJson[0]._id));

        console.log("events :::::::::: " +events );
        return events;
    }

    plotEvent = async (eventId) => {
        let eventInfo = this.eventRoute + "/" + eventId + "/status";
        let responseJson = await (await fetch(eventInfo)).json();
        console.debug(eventId);

        let resultInfo = [];
        
        console.log(responseJson);
        console.log(" for state before : " + responseJson.status.length);
        for (let i = 0; i < responseJson.status.length; i++) {
            const photoId = responseJson.status[i]._id;
            const path = responseJson.status[i].path;
            const count = responseJson.status[i].count;
            
            resultInfo.push({ id: photoId, path, count });

            console.log(" hohohohoho " + resultInfo);
        }
        return { id: eventId, resultInfo };
    }

    // before render(), setting part 
    async componentWillMount() {
        console.log("componentWillMount Entrance");
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

    render() {
        //let { imageInfos: imageInfos } = this.state;
    
        return (
          //<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>   
          <Text style={{fontSize: 20}}>{this.state.events[0].filePath}</Text>
            //this.state.events[0].photo_ID
            //this.state.events[0].filePath
            //this.state.events[0].count
          //</View>
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

