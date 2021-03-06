import { Button, Dimensions, StyleSheet, View, Image, Text, Platform, Switch, ScrollView, Alert, FlatList } from 'react-native';
import React from 'react'
import SwitchButton from "../../../Component/SwitchButton.js"
import { NavigationEvents } from 'react-navigation';
import config from '../../../Component/config';
import ActionSheet from 'react-native-actionsheet';
import DetailButton from '../../../Component/DetailButton';
import RoundedButton from '../../../Component/RoundedButton';

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
            imagePath: string,
            count: number,
            svg: any,
            key: string
        }[];
    }[]
    loading: string,
    tab: number,    // 0 : 내꺼 , 1 : 남꺼
    eventSelectedIdx: number,
    fetchCnt : number
}


export default class CheckResult extends React.Component<Props, State>{
    serverAddress = config.getConfig('serverAddress');
    eventRoute = this.serverAddress + "/events";
    index = 0;
    showStructure = [];

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
            eventSelectedIdx: 0,
            fetchCnt : 0
        }
    }

    checkingEventsOfMine = async () => {
        const userId = "bakyuns";
        const checkingMyResult = this.eventRoute + "/myEvents/" + userId + '/' + this.state.fetchCnt;
        //const checkingMyResult = this.eventRoute;

        let responseJson = await (await fetch(checkingMyResult)).json();
        let eventsSet = [];

        for (let event of responseJson) {
            eventsSet.push(await this.plotEvent(event._id));
        }
        let resultObj = { userId: userId, events: eventsSet, loading : 'finish', tab: 0 };
        return resultObj;
    }

    checkingEventsbyMe = async () => {
        const userId = "bakyuns";
        const checkingOtherResult = this.eventRoute + "/myPicks/" + userId + '/' + this.state.fetchCnt;
        //const checkingOtherResult = this.eventRoute;

        let responseJson = await (await fetch(checkingOtherResult)).json();
        let eventsSet = [];

        for (let event of responseJson) {
            eventsSet.push(await this.plotEvent(event._id));
        }
        let resultObj = { userId: userId, events: eventsSet, loading : 'finish', tab: 1 };
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
                imagePath: result.path,
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
            if (this.state.tab === 0) {
                let event = await this.checkingEventsOfMine();
                this.dataProcessing(event);
                /*this.setState(
                    event, () => this.dataProcessing()
                );*/
                //console.log(this.state);
            }
            else if (this.state.tab === 1) {
                let event = await this.checkingEventsbyMe();
                this.dataProcessing(event);
                /*this.setState(
                    event, () => this.dataProcessing()
                );*/
                //console.log(this.state);
            }
        } catch (err) {
            console.error(err);
        }
    }

    dataProcessing (resultEvent){
        console.log("hahahahaa");
        var sortedEvents = [];
        for (let event of resultEvent.events) {
            let oriStatus = event.result;
            var sortStatusByCount = oriStatus.sort(function (a, b) {
                return b.count - a.count;
            });
            sortedEvents.push({ eventId: event.eventId, title: event.title, status: event.status, result: sortStatusByCount });
        }

        var data_all = [];
        //var showStructure = [];
        sortedEvents.forEach((event, i) => {
            var data = [];
            var pasteData = [];
            var imageHeight = 160;
            var imageWidth = 160;

            for (let j of event.result) {
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

            console.log("lenghth : " + this.showStructure.length);
            this.showStructure.push(
                <View key={this.index}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, alignItems: 'flex-start', paddingHorizontal: 15 }}>
                            <RoundedButton
                                title={event.status === 'voting' ? '투표중' : '만료'}
                                styleButton={{
                                    backgroundColor: event.status === 'voting' ? 'rgba(240, 10, 10, 0.6)' : 'gray',
                                    width: 50, height: 25, padding: 5, marginBottom: 0
                                }}
                                styleText={{ color: 'white', fontSize: 12 }}
                            />
                        </View>
                        <Text style={{ fontSize: 20 }}>{event.title} </Text>
                        <View style={{ flex: 1, alignItems: 'flex-end', paddingHorizontal: 15 }}>
                            <DetailButton onPress={() => this.handleEventDetail(i)} />
                        </View>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        padding: 20, borderBottomWidth: 0.5, borderColor: '#444', borderTopWidth: 0.5
                    }}>

                        <View style={{ flex: 4, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-start' }}>
                            {pasteData}
                        </View>


                    </View>
                </View>
            )
            this.index++;
        });
        this.setState(
            resultEvent
        )

    }

    async componentDidMount() {
        console.log("componentDidMount Entrance");
        this.fetchEvents();
        console.log("componentDidMount Exit");
    }

    async changedTab() {
        console.log("ChangedTab Entrance");
        console.log("tab : " + this.state.tab);
        this.showStructure = [];
        try {
            if (this.state.tab === 0) {
                let event = await this.checkingEventsOfMine();
                this.dataProcessing(event);
                /*this.setState(
                    event, () => this.dataProcessing()
                );*/
            }
            else if (this.state.tab === 1) {
                let event = await this.checkingEventsbyMe();
                this.dataProcessing(event);
                /*this.setState(
                    event, () => this.dataProcessing()
                );*/
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

    handleLoadMore = () =>{
        this.setState({
            fetchCnt : this.state.fetchCnt + 2
        }, this.fetchEvents);
    }

    _renderItem = ({item}) => {
        return (
            <View>
                {item}
            </View>
        )

    }
    cnt = 0;
    render() {
        console.log("Check Result Render", this.cnt);
        this.cnt++;

        if (this.state.loading === 'init') {
            console.log("Setstate Not Finished")
            return( //<Text style={{ fontSize: 20 }}> Checking...</Text>
            <View>
                        
                        <View style={{
                            alignItems: 'center', justifyContent: 'center',
                            padding: 20, borderBottomWidth: 0.5, borderColor: '#444', borderTopWidth: 0.5
                        }}>
                            <SwitchButton
                                onValueChange={(val) => { this.setState({ tab: val, fetchCnt : 0 }, this.changedTab) }}      // this is necessary for this component
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
                        <Text style={{ fontSize: 20 }}> Checking...</Text>
                        
                    </View>
            )
        }

        if (this.state.loading === 'finish') {
            console.log("Setstate Finished");

            console.log("---------------- tab : ", this.state.tab);
            console.log(this.showStructure.length);
            return (
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
                                onValueChange={(val) => { this.setState({ tab: val, fetchCnt : 0 }, this.changedTab) }}      // this is necessary for this component
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
                        {this.eventSelectActionSheet}
                        <FlatList
                        data = {this.showStructure}
                        onEndReached={this.handleLoadMore}
                        onEndReachedThreshold={0}
                        renderItem={this._renderItem}
                        keyExtractor={(item, index)=>index.toString()}
                        />
                    </View>
                

            );

        }

    }

    ActionSheet = {
        eventSelect: null,
    };

    handleEventDetail = (eventSelectedIdx: number) => {
        this.setState(
            { eventSelectedIdx },
            () => this.showActionSheet('eventSelect'),
        );
    }

    /* ActionSheets */
    showActionSheet = (sheet: string) => {
        console.debug('show actionsheet ', sheet);
        this.ActionSheet[sheet].show();
    }

    get eventSelectActionSheet() {
        let options = ['자세히 보기'];
        const isMine:boolean = this.state.tab === 0;
        if (isMine) { // 내꺼
            options.push('삭제');
        } else {
            options.push('숨기기');
        }

        const cancelIdx = options.length;
        options.push('Cancel');

        return (<ActionSheet
            ref={sheet => this.ActionSheet.eventSelect = sheet}
            title={'Option'}
            options={options}
            cancelButtonIndex={cancelIdx}
            destructiveButtonIndex={cancelIdx - 1}
            onPress={(index: number) => {
                if (index == 0)
                    this.navigateToDetail(this.state.eventSelectedIdx)
                else if (index == 1) {// 삭제 or 숨기기 
                    if (isMine)
                        this.alertDelete();
                    else 
                        this.alertHide();
                }
            }}
        />);
    }

    alertDelete = () => {
        Alert.alert(
            '정말로 삭제하시겠습니까?',
            '원본 사진들은 삭제되고\n썸네일은 모자이크처리하여 보관됩니다.',
            [
                //   {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                {
                    text: '취소',
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => this.requestDelete(this.state.eventSelectedIdx) },
            ],
            { cancelable: false },
        );
    }

    requestDelete = async (eventIdx: number) => {
        const eventId = this.state.events[eventIdx].eventId;
        let response = await fetch(this.eventRoute + "/" + eventId, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
                "userid": 'bakyuns' // TODO: singed in user's id 
            },
            body: JSON.stringify({
                'eventId': eventId,
            })
        });
        if (!response.ok)
            console.error("Request Failed");
        else // status: 204 
            Alert.alert("삭제되었습니다.")

        /* TODO: Re fetch Events? */
    }

    alertHide = () => {
        Alert.alert(
            '정말로 숨기시겠습니까?',
            '숨긴 투표는 복구할 수 없습니다.',
            [
                //   {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                {
                    text: '취소',
                    style: 'cancel',
                },
                { text: '확인', onPress: () => this.requestHide(this.state.eventSelectedIdx) },
            ],
            { cancelable: false },
        );
    }

    requestHide = (eventIdx: number) => {
        console.debug('Request to Hide, but not implemented yet ', eventIdx);
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

