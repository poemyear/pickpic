import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import { Button, Dimensions, StyleSheet, View, Text, Platform } from 'react-native';
import React, { useRef, createRef } from 'react'
import SliderEntry from "../../Component/SliderEntry.js";
import Upload from "../Upload";
import { UserInterfaceIdiom } from 'expo-constants';

const { width: screenWidth } = Dimensions.get('window')
interface Props {

}
/*interface State {
    event_Id: number,
    status: {
        photo_Id:String,
        filePath:String,
        count:number
    }[];
    loading : string,
    tab : number    // 0 : 내꺼 , 1 : 남꺼
}*/

interface State {
    user_Id:string,
    events : {
        event_Id: string,
        status: {
            photo_Id:String,
            filePath:String,
            count:number
        }[];
    }[]
    loading : string,
    tab : number    // 0 : 내꺼 , 1 : 남꺼
}

export default class CheckResult extends React.Component<Props, State>{
    carouselRef = createRef<Carousel>();
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events";

    constructor(props: Props) {
        super(props);
        this.state = {
            user_Id : "",
            events : [],
            loading : "init",
            tab : 0
            /*event_Id: 0,
            status: [],
            loading : "init",
            tab : 0*/
        }
    }

    checkingEventsOfMine = async () => {
        const userId = "5d60e920ca22b86af6f07c68";
        //const checkingMyResult = this.eventRoute + "eventsbyowner/" + userId;
        const checkingMyResult = this.eventRoute;

        let responseJson = await (await fetch(checkingMyResult)).json();
        let eventsSet = [];
        
        for( let event of responseJson)
        {
            eventsSet.push(await this.plotEvent(event._id));
        }
        let resultObj = {user_Id : userId, events : eventsSet, loading : "finish", tab : 0};
        return resultObj;
    }
    
    checkingEventsbyMe = async () => {
        const userId = "5d60e920ca22b86af6f07c68";
        const checkingOtherResult = this.eventRoute + "eventsbyvoter/" + userId;

        let responseJson = await (await fetch(checkingOtherResult)).json();
        let eventsSet = [];
        
        for( let event of responseJson)
        {
            eventsSet.push(await this.plotEvent(event._id));
        }
        let resultObj = {user_Id : userId, events : eventsSet, loading : "finish", tab : 1};
        return resultObj;
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
            const path = this.serverAddress + "/"+ responseJson.status[i].path;
            const cnt = responseJson.status[i].count;
            
            resultInfo.push( { photo_Id : photoId, filePath : path, count : cnt });
        }
        let resultObj = {event_Id : eventId , status: resultInfo};
        return resultObj;
    }

    async componentDidMount() {
        console.log("componentDidMount Entrance");
        try {
            if(this.state.tab === 0)
            {
                let event = await this.checkingEventsOfMine();
                this.setState(
                 event
                );
                console.log(this.state);
            }
            else if(this.state.tab === 1)
            {
                let event = await this.checkingEventsbyMe();
                this.setState(
                 event
                );
                console.log(this.state);                
            }
            /*let event = await this.fetchEvent();
                this.setState(
                 event
                );
            console.log(this.state);*/
        } catch (err) {
            console.error(err);
        }
        console.log("componentDidMount Exit");
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
        if(this.state.loading === 'init'){
            console.log("Setstate Not Finished")
            return <Text style={{fontSize: 20}}> Checking...</Text>
        }

        if(this.state.loading === 'finish'){
            console.log("Setstate Finished");
            
            var sortedEvents = [];
            for(let i = 0 ; i < this.state.events.length ; i++)
            {
                let oriStatus = this.state.events[i].status;
                var sortStatusByCount = oriStatus.sort(function(a,b){
                    return b.count - a.count;
                });
                sortedEvents.push({event_Id : this.state.events[i].event_Id, status : sortStatusByCount});
            }

            console.log(sortedEvents);

            var data_all = [];
            for(let i of sortedEvents)
            {   
                var data = [];
                for(let j of i.status)
                {
                    data.push({id : j.photo_Id, uri: j.filePath});
                }
                data_all.push(data);
            }

            var showStructure = [];
            for(let k = 0 ; k < data_all.length ; k++)
            {
                showStructure.push(               
                    <Carousel key={k}
                    ref={this.carouselRef}
                    sliderWidth={screenWidth}
                    sliderHeight={screenWidth}
                    itemWidth={screenWidth - 200}
                    data={data_all[k]} //{this.state.events[this.state.eventIdx].photos}
                    renderItem={this._renderItem}
                    hasParallaxImages={true}
                    />)
            }
            
            return (
                //일단 첫번째만 출력하도록 , 값이 들어와서 표출되는지만 확인
                //어떤 화면으로 어떻게 표출할지는 논의 필요
                <View>
                    {showStructure}
                </View>
            );
            
        }

      }
}

const styles = StyleSheet.create({
    item: {
        width: screenWidth - 150,
        height: screenWidth - 150,
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

