import { Button, Dimensions, StyleSheet, View, Text, Platform, ProgressViewIOSComponent } from 'react-native';
import React from 'react'
import { BarChart, Grid, YAxis } from 'react-native-svg-charts'
import { Defs, LinearGradient, Text as SvgText, Image as SvgImage, Stop } from "react-native-svg";
import * as scale from 'd3-scale'
import { PieChart } from 'react-native-svg-charts'
import { Circle, G, Line } from 'react-native-svg'
import moment from 'moment';

const { width: screenWidth } = Dimensions.get('window')
interface Props {
    eventId: string,
    eventTitle: string,
    eventStatus: string,
    eventCreatedAt: string,
    eventExpiredAt: string,
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
        key: string,
        svg: { fill: string },
        thumbnailPath: string
    }[]
}

export default class Detail extends React.Component<Props, State>{
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events";

    constructor(props: Props) {
        super(props);
        const randomColor = () => {
            return { fill: ('#' + (Math.random() * 0xFFFFFF << 0).toString(16) + '000000').slice(0, 7) };
        }
        let data = [];
        this.props.eventResult.map(result => data.push({ ...result, svg: randomColor() }));
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

        const CUT_OFF = 5;
        const PieLabels = ({ slices }) => {
            return slices.map((slice, index) => {
                const { labelCentroid, pieCentroid, data } = slice;
                return (
                    <G key={index}>
                        <Line
                            x1={labelCentroid[0]}
                            y1={labelCentroid[1]}
                            x2={pieCentroid[0]}
                            y2={pieCentroid[1]}
                            stroke={data.svg.fill}
                        />
                        {/* <Circle
                                cx={ labelCentroid[ 0 ] }
                                cy={ labelCentroid[ 1 ] }
                                r={ 15 }
                                fill={ data.svg.fill }
                            /> */}
                        <SvgImage
                            x={labelCentroid[0]}
                            y={labelCentroid[1]}
                            width={20}
                            height={20}
                            preserveAspectRatio="xMidYMid slice"
                            opacity="1"
                            href={{ uri: "http://localhost:3000/" + data.thumbnailPath }}
                        />
                    </G>
                )
            })
        }

        const Labels = ({ x, y, bandwidth, data }) => (
            data.map((value, index) => (
                // <SvgText
                //     key={ index }
                //     x={ value.count > 5 ? x(0) + 10 : x(value.count) + 10 }
                //     y={ y(index) + (bandwidth / 2) }
                //     fontSize={ 14 }
                //     fill={ value.count > 5 ? 'white' : 'black' }
                //     alignmentBaseline={ 'middle' }
                // >
                //     {value.count}
                // </SvgText>
                <SvgImage
                    key={this.props.eventId + index}
                    x={value.count > 5 ? x(0) + 10 : x(value.count) + 10}
                    y={y(index)}// + (bandwidth / 2)}
                    width={bandwidth}
                    height={bandwidth}
                    // preserveAspectRatio="xMidYMid slice"
                    preserveAspectRatio="none"
                    opacity="1"
                    href={{ uri: "http://localhost:3000/" + value.thumbnailPath }}
                />
            ))
        )
        const srcData = this.state.data;
        return (
            <View>
                <View>
                    <Text> Title: {this.props.eventTitle} </Text>
                    <Text> Status: {this.props.eventStatus} </Text>
                    <Text> CreatedAt: {this.props.eventCreatedAt} </Text>
                    <Text> ExpiredAt: {this.props.eventExpiredAt} </Text>
                    <Text> Expired {moment(this.props.eventExpiredAt).fromNow()}</Text>
                </View>
                <View style={{ flexDirection: 'row', width: '90%', height: '60%', paddingVertical: 16 }}>
                    <YAxis
                        data={srcData}
                        yAccessor={({ index }) => index}
                        scale={scale.scaleBand}
                        contentInset={{ top: 10, bottom: 10 }}
                        // contentInset={{ top: 10, bottom: 10, left:100, right:100 }}
                        spacing={0.2}
                        formatLabel={(_, index) => srcData[index].key}
                    />
                    <BarChart
                        style={{ flex: 1, marginLeft: 8 }}
                        data={srcData}
                        horizontal={true}
                        yAccessor={({ item }) => item.count}
                        contentInset={{ top: 10, bottom: 10 }}
                        spacing={0.2}
                        gridMin={0}
                    >
                        {/* <Grid direction={Grid.Direction.VERTICAL}/> */}
                        <Labels x={0} y={0} bandwidth={20} data={srcData} />
                    </BarChart>
                </View>
                <View>
                    <PieChart
                        style={{ height: 200 }}
                        data={srcData}
                        valueAccessor={({ item }) => item.count}
                        innerRadius={20}
                        outerRadius={55}
                        labelRadius={80}
                    >
                        <PieLabels slices={srcData} />
                    </PieChart>
                </View>
            </View>
        );

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

