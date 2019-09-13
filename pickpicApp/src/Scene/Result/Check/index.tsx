import { Button, Dimensions, StyleSheet, View, Image, Text, Platform, Switch, ScrollView } from 'react-native';
import React from 'react'
import SwitchButton from "../../../Component/SwitchButton.js"
import { NavigationEvents } from 'react-navigation';

const { width: screenWidth } = Dimensions.get('window')
interface Props {
    navigation: any
}

interface State {
    userId: string,
    events: {
        eventId: string,
        title: string,
        status: string,
        createdAt: string,
        expiredAt: string,
        totalVote: number,
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
}


export default class CheckResult extends React.Component<Props, State>{
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events";

    constructor(props: Props) {
        super(props);
        this.state = {
            userId: "",
            events: [],
            loading: "init",
            tab: 0,
            /*eventId: 0,
            status: [],
            loading : "init",
            tab : 0*/
        }
    }

    checkingEventsOfMine = async () => {
        const userId = "bakyuns";
        const checkingMyResult = this.eventRoute + "/myEvents/" + userId;
        //const checkingMyResult = this.eventRoute;

        let responseJson = await (await fetch(checkingMyResult)).json();
        let eventsSet = [];

        for (let event of responseJson) {
            eventsSet.push(await this.plotEvent(event._id));
        }
        let resultObj = { userId: userId, events: eventsSet, loading: "finish", tab: 0 };
        return resultObj;
    }

    checkingEventsbyMe = async () => {
        const userId = "bakyuns";
        const checkingOtherResult = this.eventRoute + "/myPicks/" + userId;
        //const checkingOtherResult = this.eventRoute;

        let responseJson = await (await fetch(checkingOtherResult)).json();
        let eventsSet = [];

        for (let event of responseJson) {
            eventsSet.push(await this.plotEvent(event._id));
        }
        let resultObj = { userId: userId, events: eventsSet, loading: "finish", tab: 1 };
        return resultObj;
    }

    plotEvent = async (eventId) => {
        let eventInfo = this.eventRoute + "/" + eventId + "/status";
        let responseJson = await (await fetch(eventInfo)).json();
        let resultInfo = [];
        let sum = 0;
        for (const [i, result] of responseJson.result.entries()) {
            const dummyCount = result.count + Math.floor(Math.random() * 1000) + 3;
            resultInfo.push({
                photoId: result._id,
                path: result.path,
                // count: result.count
                count: dummyCount,
                thumbnailPath: result.thumbnailPath,
                key: i
            });
            sum += dummyCount;
        }
        let resultObj = {
            eventId: eventId,
            title: responseJson.title,
            status: responseJson.status,
            createdAt: responseJson.createdAt,
            expiredAt: responseJson.expiredAt,
            totalVote: sum,
            result: resultInfo
        };
        return resultObj;
    }

    fetchEvents = async () => {
        try {
            console.log(this.state);
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
    }

    async componentDidMount() {
        console.log("componentDidMount Entrance");
        this.fetchEvents();
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

    navigateToDetail = (idx: number) => {
        this.props.navigation.navigate('Detail', this.state.events[idx]);
    }

    componentWillReceiveProps() {
        console.log('rerender here')
        //this.yourFunction()
        //this.setState({})
    }


    cnt = 0;
    render() {
        console.log("Check Result Render", this.cnt);
        this.cnt++;

        if (this.state.loading === 'init') {
            console.log("Setstate Not Finished")
            return <Text style={{ fontSize: 20 }}> Checking...</Text>
        }

        if (this.state.loading === 'finish') {
            console.log("Setstate Finished");

            var sortedEvents = [];
            for (let event of this.state.events) {
                let oriStatus = event.result;
                var sortStatusByCount = oriStatus.sort(function (a, b) {
                    return b.count - a.count;
                });
                sortedEvents.push({ eventId: event.eventId, title: event.title, status: sortStatusByCount });
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
                    <View key={event.eventId}>
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
                                <Button title="..." onPress={() => this.navigateToDetail(i)} />
                            </View>
                        </View>
                    </View>

                    //</View>

                )
            });

            console.log("---------------- tab : ", this.state.tab);
            return (
                <ScrollView>
                <View>
                    <NavigationEvents
                        onWillFocus={this.fetchEvents}
                        // onDidFocus={payload => console.log('did focus')}
                        // onWillBlur={payload => console.log('will blur')}
                        // onDidBlur={payload => console.log('did blur')}
                    />
                    <View style={{
                        alignItems: 'center', justifyContent: 'center',
                        padding: 20, borderBottomWidth: 0.5, borderColor: '#444', borderTopWidth: 0.5
                    }}>
                        <SwitchButton
                            onValueChange={(val) => { this.setState({ tab: val }, this.changedTab) }}      // this is necessary for this component
                            text1='My Events'                        // optional: first text in switch button --- default ON
                            text2='My Picks'                       // optional: second text in switch button --- default OFF
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
                </ScrollView>

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

