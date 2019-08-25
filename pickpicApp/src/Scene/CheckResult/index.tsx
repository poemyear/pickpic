import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import { Button, Dimensions, StyleSheet, View, Text, Platform } from 'react-native';
import React, { useRef, createRef } from 'react'
import SliderEntry from "../../Component/SliderEntry.js";
import Upload from "../Upload";

const { width: screenWidth } = Dimensions.get('window')
interface Props {

}
interface State {
    event_Id: number,
    status: {
        photo_Id:String,
        filePath:String,
        count:number
    }[];
    loading : string
}


export default class CheckResult extends React.Component<Props, State>{
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events";

    constructor(props: Props) {
        super(props);
        this.state = {
            event_Id: 0,
            status: [],
            loading : "init"
        }
    }

    fetchEvent = async () => {
        let responseJson = await (await fetch(this.eventRoute)).json();
        let event = await this.plotEvent(responseJson[0]._id);
        return event;
    }

    plotEvent = async (eventId) => {
        let eventInfo = this.eventRoute + "/" + eventId + "/status";
        let responseJson = await (await fetch(eventInfo)).json();

        let resultInfo = [];
        for (let i = 0; i < responseJson.status.length; i++) {
            const photoId = responseJson.status[i]._id;
            const path = responseJson.status[i].path;
            const cnt = responseJson.status[i].count;
            
            resultInfo.push( { photo_Id : photoId, filePath : path, count : cnt });
        }
        let resultObj = {event_Id : eventId , status: resultInfo, loading : "finish"};
        return resultObj;
    }

    async componentDidMount() {
        console.log("componentDidMount Entrance");
        try {
            let event = await this.fetchEvent();
            this.setState(
                event
            );
            console.log(this.state);
        } catch (err) {
            console.error(err);
        }
        console.log("componentDidMount Exit");
    }

    render() {
        if(this.state.loading === 'init'){
            console.log("Setstate Not Finished")
            return <Text style={{fontSize: 20}}> Checking...</Text>
        }

        if(this.state.loading === 'finish'){
            console.log("Setstate Finished");
            return (
                //일단 첫번째만 출력하도록 , 값이 들어와서 표출되는지만 확인
                //어떤 화면으로 어떻게 표출할지는 논의 필요
                <Text style={{fontSize: 20}}>event ID : {this.state.event_Id }{"\n"}photo ID : {this.state.status[0].photo_Id}{"\n"} 
                file path : {this.state.status[0].filePath}{"\n"}count : {this.state.status[0].count}{"\n"}</Text>
              );
            }
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

