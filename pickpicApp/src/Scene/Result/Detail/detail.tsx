import { Image, Dimensions, StyleSheet, View, Text, Modal } from 'react-native';
import React from 'react'
import { BarChart, YAxis } from 'react-native-svg-charts'
import { Text as SvgText, Image as SvgImage, Stop } from "react-native-svg";
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
    eventTotalVote: number,
    eventResult: {
        photoId: string,
        path: string,
        count: number,
        key: string,
        thumbnailPath: string
        imagePath: string
    }[]
}
interface State {
    data: {
        photoId: string,
        path: string,
        count: number,
        percent: string,
        key: string,
        svg: { fill: string, onPressIn: any, onPressOut: any },
        thumbnailPath: string,
        imagePath: string
    }[],
    modalVisible: boolean,
    modalImagePath: string,
}

export default class Detail extends React.Component<Props, State>{
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events";

    constructor(props: Props) {
        super(props);
        const randomColor = () => {
            return ('#' + (Math.random() * 0xFFFFFF << 0).toString(16) + '000000').slice(0, 7);
        }
        let data = [];
        this.props.eventResult.map(result => data.push({
            ...result,
            svg: {
                fill: randomColor(),
                onPressIn: () => { this.setState({ modalVisible: true, modalImagePath: result.imagePath }) },
                onPressOut: () => { this.setState({ modalVisible: false, modalImagePath: null }) }
            },
            percent: (result.count * 100 / this.props.eventTotalVote).toPrecision(2) + "%"
        }));

        this.state = { data, modalVisible: false, modalImagePath: null };
    }

    render() {
        const srcData = this.state.data;
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
                    {this.renderYaxis}
                    {this.renderBarChart}
                </View>
                <Text style={{ textAlign: 'center', color: 'gray' }}> 차트를 터치하면 사진이 확대됩니다. </Text>
                <View style={{ flex: pieFlex }}>
                    {this.renderPieChart}
                </View>
                {this.modalPressInImageVIew}
            </View>
        );
    }

    get renderYaxis() {
        const srcData = this.state.data;

        return (<YAxis
            style={{ width: 10 }}
            data={srcData}
            yAccessor={({ index }) => index}
            scale={scale.scaleBand}
            contentInset={{ top: 10, bottom: 10 }}
            // contentInset={{ top: 10, bottom: 10, left:100, right:100 }}
            spacing={0.2}
            formatLabel={(_, index) => srcData[index].key}
        />);
    }

    get renderBarChart() {
        const srcData = this.state.data;

        const Thumbnails = ({ x, y, bandwidth, data }) => (
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
        const Labels = ({ x, y, bandwidth, data }) => (
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

        return (
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
                <Thumbnails bandwidth={20} data={srcData} />
                <Labels bandwidth={10} data={srcData} />
            </BarChart>);
    }

    get renderPieChart() {
        const srcData = this.state.data;

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
                            href={{ uri: "http://localhost:3000/" + data.thumbnailPath }}
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

        return (
            <PieChart
                style={{ flex: 1 }}
                data={srcData}
                valueAccessor={({ item }) => item.count}
                outerRadius={'75%'}
                innerRadius={'20%'}
                labelRadius={'90%'}
            >
                <PieLabels slices={srcData} />
            </PieChart>);
    }

    /* Modal */
    handleModalClose = () => {
        this.setState({
            modalVisible: false,
        });
    }

    get modalPressInImageVIew() {
        const modalImagePath = this.state.modalImagePath;
        return (
            { modalImagePath } &&
            <Modal
                animationType='none'
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={this.handleModalClose}
            >
                <View style={[styles.overlay]}>
                    <Image
                        key={this.props.eventId + 123}
                        style={{ width: screenWidth - 30, height: screenWidth - 30 }}
                        source={{ uri: this.serverAddress + "/" + modalImagePath }}
                    />
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.3)',
        alignItems: 'center',
        justifyContent: 'center'
    },
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

