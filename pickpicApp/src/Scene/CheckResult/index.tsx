import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import { Button, Dimensions, StyleSheet, View, Image, Text, Platform, Switch } from 'react-native';
import React, { useRef, createRef } from 'react'
import SliderEntry from "../../Component/SliderEntry.js";
import Upload from "../Upload";
import { UserInterfaceIdiom } from 'expo-constants';
import SwitchButton from "../../Component/SwitchButton.js"

import Detail from '../ResultDetail/detail'


const { width: screenWidth } = Dimensions.get('window')
interface Props {

}

interface State {
    user_Id: string,
    events: {
        event_Id: string,
        title: string,
        status: string,
        createdAt: string,
        expiredAt: string,
        result: {
            photoId: string,
            path: string,
            thumbnailPath: string,
            count: number,
            svg: any,
            key: string
        }[];
    }[]
    loading: string,
    tab: number,    // 0 : 내꺼 , 1 : 남꺼
    isDetail: boolean,
    detailIdx: number,
}


export default class CheckResult extends React.Component<Props, State>{
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events";

    constructor(props: Props) {
        super(props);
        this.state = {
            user_Id: "",
            events: [],
            loading: "init",
            tab: 0,
            isDetail: false,
            detailIdx: -1,
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

        for (let event of responseJson) {
            eventsSet.push(await this.plotEvent(event._id));
        }
        let resultObj = { user_Id: userId, events: eventsSet, loading: "finish", tab: 0 };
        return resultObj;
    }

    checkingEventsbyMe = async () => {
        const userId = "5d60e920ca22b86af6f07c68";
        //const checkingOtherResult = this.eventRoute + "eventsbyvoter/" + userId;
        const checkingOtherResult = this.eventRoute;

        let responseJson = await (await fetch(checkingOtherResult)).json();
        let eventsSet = [];

        for (let event of responseJson) {
            eventsSet.push(await this.plotEvent(event._id));
        }
        let resultObj = { user_Id: userId, events: eventsSet, loading: "finish", tab: 1 };
        return resultObj;
    }

    plotEvent = async (eventId) => {
        let eventInfo = this.eventRoute + "/" + eventId + "/status";
        let responseJson = await (await fetch(eventInfo)).json();
        let resultInfo = [];
        for (const [i, result] of responseJson.result.entries()) {
            resultInfo.push({
                photoId: result._id,
                path: result.path,
                count: result.count + Math.random() % 20,
                thumbnailPath: result.thumbnailPath,
                key: i
            });
        }
        let resultObj = {
            event_Id: eventId,
            title: responseJson.title,
            status: responseJson.status,
            createdAt: responseJson.createdAt,
            expiredAt: responseJson.expiredAt,
            result: resultInfo
        };
        return resultObj;
    }

    async componentDidMount() {
        console.log("componentDidMount Entrance");
        try {
            if (this.state.tab === 0) {
                let event = await this.checkingEventsOfMine();
                this.setState(
                    event
                );
            }
            else if (this.state.tab === 1) {
                let event = await this.checkingEventsbyMe();
                this.setState(
                    event
                );
                console.log(this.state);
            }
        } catch (err) {
            console.error(err);
        }
        console.log("componentDidMount Exit");
    }
    async changedTab() {
        console.log("ChangedTab Entrance");
        console.log("tab : " + this.state.tab);
        try {
            if (this.state.tab === 0) {
                let event = await this.checkingEventsOfMine();
                this.setState(
                    event
                );
            }
            else if (this.state.tab === 1) {
                let event = await this.checkingEventsbyMe();
                this.setState(
                    event
                );
                console.log(this.state);
            }
        } catch (err) {
            console.error(err);
        }
        console.log("ChangedTab Exit");
    }

    exitFromDetail = () => {
        this.setState({
            isDetail: false,
            detailIdx: -1
        })
    }
    changeToDetail = (idx: number) => {
        this.setState({
            isDetail: true,
            detailIdx: idx
        })
    }
    get renderDetail() {
        const detailEvent = this.state.events[this.state.detailIdx];
        console.log(detailEvent);
        return (
            <Detail
                eventTitle={detailEvent.title}
                eventId={detailEvent.event_Id}
                eventCreatedAt={detailEvent.createdAt}
                eventExpiredAt={detailEvent.expiredAt}
                eventResult={detailEvent.result}
                eventStatus={detailEvent.status}
            />
        )
    }

    render() {
        if (this.state.loading === 'init') {
            console.log("Setstate Not Finished")
            return <Text style={{ fontSize: 20 }}> Checking...</Text>
        }

        if (this.state.loading === 'finish' && this.state.isDetail == true) {
            return (<View style={{ flex: 1 }}>
                <View>
                    <Button title="Exit" onPress={() => this.exitFromDetail()} />
                </View>
                <View></View>
                <View>{this.renderDetail}</View>
            </View>);

        }

        if (this.state.loading === 'finish' && this.state.isDetail == false) {
            console.log("Setstate Finished");

            var sortedEvents = [];
            for (let event of this.state.events) {
                let oriStatus = event.result;
                var sortStatusByCount = oriStatus.sort(function (a, b) {
                    return b.count - a.count;
                });
                sortedEvents.push({ event_Id: event.event_Id, title: event.title, status: sortStatusByCount });
            }

            var data_all = [];
            var showStructure = [];
            sortedEvents.forEach((event, i) => {
                var data = [];
                var pasteData = [];
                var imageHeight = 160;
                var imageWidth = 160;

                for (let j of event.status) {
                    var data_item = { id: j.photoId, uri: this.serverAddress + "/" + j.path };
                    data.push(data_item);

                    pasteData.push(
                        <Image key={j.photoId}
                            style={{ height: imageHeight, width: imageWidth }}
                            source={data_item}
                        />
                    )
                    imageHeight -= 40;
                    imageWidth -= 40;
                }
                data_all.push(data);
                showStructure.push(
                    <View key={event.event_Id}>
                        <View>
                            <Text style={{ fontSize: 20 }}>{event.title} </Text>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            padding: 20, borderBottomWidth: 0.5, borderColor: '#444', borderTopWidth: 0.5
                        }}>

                            <View style={{ flex: 4, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-start' }}>
                                {pasteData}
                            </View>

                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Button title="..." onPress={() => this.changeToDetail(i)} />
                            </View>
                        </View>
                    </View>

                    //</View>

                )
            });

            console.log("---------------- tab : ", this.state.tab);
            return (
                <View>
                    <View style={{
                        alignItems: 'center', justifyContent: 'center',
                        padding: 20, borderBottomWidth: 0.5, borderColor: '#444', borderTopWidth: 0.5
                    }}>
                        <SwitchButton
                            onValueChange={(val) => { this.setState({ tab: val }, this.changedTab) }}      // this is necessary for this component
                            text1='My Pick'                        // optional: first text in switch button --- default ON
                            text2='Your Pick'                       // optional: second text in switch button --- default OFF
                            switchWidth={250}                 // optional: switch width --- default 44
                            switchHeight={44}                 // optional: switch height --- default 100
                            switchdirection='ltr'             // optional: switch button direction ( ltr and rtl ) --- default ltr
                            switchBorderRadius={100}          // optional: switch border radius --- default oval
                            switchSpeedChange={500}           // optional: button change speed --- default 100
                            switchBorderColor='#d4d4d4'       // optional: switch border color --- default #d4d4d4
                            switchBackgroundColor='#fff'      // optional: switch background color --- default #fff
                            btnBorderColor='#00a4b9'          // optional: button border color --- default #00a4b9
                            btnBackgroundColor='#00bcd4'      // optional: button background color --- default #00bcd4
                            fontColor='#b1b1b1'               // optional: text font color --- default #b1b1b1
                            activeFontColor='#fff'            // optional: active font color --- default #fff
                        />
                    </View>
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

