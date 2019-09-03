import { Button, Dimensions, StyleSheet, View, Text, Platform } from 'react-native';
import React, { createRef } from 'react'
import { BarChart, Grid, YAxis } from 'react-native-svg-charts'
import { Defs, LinearGradient, Text as SvgText, Image as SvgImage, Stop } from "react-native-svg";
import * as scale from 'd3-scale'
import { PieChart } from 'react-native-svg-charts'
import { Circle, G, Line } from 'react-native-svg'
import Detail from './detail'

const { width: screenWidth } = Dimensions.get('window')
interface Props {
}
interface State {
}

export default class CheckResult extends React.Component<Props, State>{
    serverAddress = "http://localhost:3000";
    eventRoute = this.serverAddress + "/events"; 
    randomColor = () => ('#' + (Math.random() * 0xFFFFFF << 0).toString(16) + '000000').slice(0, 7)
    sample = {
        _id: "5d6a9ed947c678756e46ddf5",
        title: "TEST.",
        status: "expired",
        createdAt: "2019-08-31T16:22:49.952Z",
        expiredAt: "2019-08-31T16:22:23.712Z",
        result: [
            {
                photoId: "5d6a9ed947c678756e46ddf5",
                path: "upload/BCAD30EF-8AB8-42D4-B958-02E6D50AC39C-1567268569922.jpg",
                count: 0,
                key: "pie-1",
                thumbnailPath: "thumbnail/thumb_BCAD30EF-8AB8-42D4-B958-02E6D50AC39C-1567268569922.jpg"
            },
            {
                photoId: "5d6a9ed947c678756e46ddf4",
                path: "upload/B8AB6C6D-2741-4286-829E-F0369C2FC9D0-1567268569927.jpg",
                count: 0,
                key: 'pie-2',
                thumbnailPath: "thumbnail/thumb_B8AB6C6D-2741-4286-829E-F0369C2FC9D0-1567268569927.jpg"
            },
            {
                photoId: "5d6a9ed947c678756e46ddf3",
                path: "upload/670C9B2E-3497-4F9C-A215-5DCADD62B272-1567268569930.jpg",
                count: 10,
                key: 'pie-3',
                thumbnailPath: "thumbnail/thumb_670C9B2E-3497-4F9C-A215-5DCADD62B272-1567268569930.jpg"
            },
            {
                photoId: "5d6a9ed947c678756e46ddf2",
                path: "upload/E75FF6D2-EF65-4E3E-A384-E84D40876164-1567268569932.jpg",
                count: 4,
                key: 'pie-4',
                thumbnailPath: "thumbnail/thumb_E75FF6D2-EF65-4E3E-A384-E84D40876164-1567268569932.jpg"
            }
        ]
    };

    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <View>
                <Detail 
                    eventTitle = {this.sample.title}
                    eventId = {this.sample._id}
                    eventCreatedAt = {this.sample.createdAt}
                    eventExpiredAt = {this.sample.expiredAt}
                    eventResult = {this.sample.result}
                    eventStatus = {this.sample.status}
                />
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

