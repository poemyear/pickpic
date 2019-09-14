import { Button, Image, Dimensions, StyleSheet, View, Text, Platform, ProgressViewIOSComponent, ScrollView } from 'react-native';
import React from 'react'
import { BarChart, Grid, YAxis } from 'react-native-svg-charts'
import { Defs, LinearGradient, Text as SvgText, Image as SvgImage, Stop } from "react-native-svg";
import * as scale from 'd3-scale'
import { PieChart } from 'react-native-svg-charts'
import { Circle, G, Line } from 'react-native-svg'
import moment from 'moment';
import config from '../../../Component/config';

const { width: screenWidth } = Dimensions.get('window')
interface Props {
    eventId: string,
    eventTitle: string,
    eventStatus: string,
    eventCreatedAt: string,
    eventExpiredAt: string,
    eventTotalVote: number,
    eventResult: {
        photoId: string,
        path: string,
        count: number,
        key: string,
        // svg: any,
        thumbnailPath: string
    }[]
}
interface State {
    data: {
        photoId: string,
        path: string,
        count: number,
        percent: string,
        key: string,
        svg: { fill: string },
        thumbnailPath: string
    }[]
}

export default class Detail extends React.Component<Props, State>{
    serverAddress = config.getConfig('serverAddress');
    eventRoute = this.serverAddress + "/events";

    constructor(props: Props) {
        super(props);
        const randomColor = () => {
            return { fill: ('#' + (Math.random() * 0xFFFFFF << 0).toString(16) + '000000').slice(0, 7) };
        }
        let data = [];
        console.log(this.props.eventTotalVote);
        this.props.eventResult.map(result => data.push({ ...result, svg: randomColor(), percent: (result.count * 100 / this.props.eventTotalVote).toPrecision(2) + "%" }));
        this.state = { data };
    }

    render() {
        const Gradient = () => (
            <Defs key={'gradient'}>
                <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'100%'} y2={'0%'}>
                    <Stop offset={'0%'} stopColor={'rgb(134, 65, 244)'} />
                    <Stop offset={'100%'} stopColor={'rgb(66, 194, 244)'} />
                </LinearGradient>
            </Defs>
        )

        const PieLabels = ({ slices }) => {
            return slices.map((slice, index) => {
                const { labelCentroid, pieCentroid, data } = slice;
                const imageSize = 30;
                return (
                    <G key={index}>
                        <Line
                            x1={labelCentroid[0]}
                            y1={labelCentroid[1]}
                            x2={pieCentroid[0]}
                            y2={pieCentroid[1]}
                            opacity="0.5"
                            stroke={data.svg.fill}
                            strokeWidth={3}
                        />
                        {/* <Circle
                                cx={ labelCentroid[ 0 ] }
                                cy={ labelCentroid[ 1 ] }
                                r={ 15 }
                                fill={ data.svg.fill }
                            /> */}
                        <SvgImage
                            x={labelCentroid[0] - imageSize / 2}
                            y={labelCentroid[1] - imageSize / 2}
                            width={imageSize}
                            height={imageSize}
                            preserveAspectRatio="xMidYMid slice"
                            opacity="1"
                            href={{ uri: this.serverAddress + data.thumbnailPath }}
                        />
                        <SvgText
                            key={index}
                            x={pieCentroid[0]}
                            y={pieCentroid[1]}
                            fontSize={14}
                            fill={'white'}
                            textAnchor={'middle'}
                            alignmentBaseline={'middle'}
                            stroke={'black'}
                            strokeWidth={0.02}
                        >
                            {data.percent}
                        </SvgText>
                    </G>
                )
            })
        }

        const Thumanails = ({ x, y, bandwidth, data }) => (
            data.map((value, index) => (
                <SvgImage
                    key={this.props.eventId + index}
                    x={x(value.count) + 10}
                    y={y(index)}
                    width={bandwidth}
                    height={bandwidth}
                    preserveAspectRatio="none"
                    opacity="1"
                    href={{ uri: this.serverAddress + "/" + value.thumbnailPath }}
                />
            ))
        )
        const Lables = ({ x, y, bandwidth, data }) => (
            data.map((value, index) => (
                <SvgText
                    key={index}
                    x={x(0) + 10}
                    y={y(index) + (bandwidth / 2)}
                    fontSize={14}
                    fill={'white'}
                    alignmentBaseline={'middle'}
                >
                    {value.count}
                </SvgText>
            ))
        )

        const srcData = this.state.data;

        this.props.eventResult.map
        let barFlex = srcData.length;
        let pieFlex = 5;
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.eventInfoContainer}>
                    <Text style={styles.title}>{this.props.eventTitle}</Text>
                    <Text> CreatedAt: {this.props.eventCreatedAt} </Text>
                    <Text> ExpiredAt: {this.props.eventExpiredAt} </Text>
                    <Text> Expired {moment(this.props.eventExpiredAt).fromNow()}</Text>
                </View>
                <View style={{ flex: barFlex, flexDirection: "row", }}>
                    <YAxis
                        style={{ width: 10 }}
                        data={srcData}
                        yAccessor={({ index }) => index}
                        scale={scale.scaleBand}
                        contentInset={{ top: 10, bottom: 10 }}
                        // contentInset={{ top: 10, bottom: 10, left:100, right:100 }}
                        spacing={0.2}
                        formatLabel={(_, index) => srcData[index].key}
                    />
                    <BarChart
                        style={{ flex: 8, marginLeft: 10 }}
                        data={srcData}
                        horizontal={true}
                        yAccessor={({ item }) => item.count}
                        contentInset={{ right: 100 }}
                        spacing={0.2}
                        animate={true}
                        animationDuration={500}
                        gridMin={0}
                    >
                        {/* <Grid direction={Grid.Direction.VERTICAL}/> */}
                        <Thumanails bandwidth={20} data={srcData} />
                        <Lables bandwidth={10} data={srcData} />

                    </BarChart>
                </View>
                <View style={{ flex: pieFlex }}>
                    <PieChart
                        style={{ flex: 1 }}
                        data={srcData}
                        valueAccessor={({ item }) => item.count}
                        outerRadius={'75%'}
                        innerRadius={'20%'}
                        labelRadius={'90%'}
                    >
                        <PieLabels slices={srcData} />
                    </PieChart>
                </View>
            </View>
        );

    }
}

const styles = StyleSheet.create({
    eventInfoContainer: {
        height: "15%",
    },
    chartConatiner: {
        flex: 1,
    },
    title: {
        paddingHorizontal: 30,
        backgroundColor: 'transparent',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
    },
})

