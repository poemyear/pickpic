import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import {Dimensions, StyleSheet, View, Text, Platform} from 'react-native';
import React from "react";
import SliderEntry from "../../Component/SliderEntry.js";

const { width: screenWidth } = Dimensions.get('window')
interface Props {
    data: {title:string, subtitle:string, illustration:string}[]
}
interface State {
    uri:String[];
    filePath:String[];
}
export default class MyCarousel extends React.Component<Props, State>{

    constructor(props: Props)
    {
        super(props);
        this.state = {
            uri : [],
            filePath : []
        }
    }

    // before render(), setting part 
    componentWillMount() {
            console.log("componentDidMount Entrance");  
            //fetch("https://facebook.github.io/react-native/movies.json")  // for test
            fetch("http:localhost:3000/events")
            .then(response => {
              //console.log(response);
              return response.json();
            })
            .then(responseJson => {
              var PlusUri = "http://localhost:3000/";
              //var length = responseJson.movies.length;    // for test
              var length = responseJson.photos.length;
              var pathArray = new Array();  // variable for saving photos-Path

              for(var i = 0 ; i < length ; i++)
              {
                  //pathArray[i] = "https://i.imgur.com/UYiroysl.jpg";  // for test
                  pathArray[i] = PlusUri + responseJson.photos[i].path;
                  console.log("PathArray["+i+"] = "+pathArray[i]);
              }
              this.setState({
                filePath : pathArray
              }, ()=>{
                  console.log("SetState Callback  "+ this.state.filePath);
              });
            })
            .then
            ()
            .catch(error =>{
                console.error(error);
            })
        }

    _renderItem ({item, index}, parallaxProps) {
        console.log("_renderItem Start")
        return (
            <View style={styles.item}>
            <ParallaxImage
                source={{ uri: this.state.filePath[index]}}
                containerStyle={styles.imageContainer}
                style={styles.image}
                parallaxFactor={0.4}
                {...parallaxProps}
            />
            <Text style={styles.title}>{ item.title }</Text>

            </View> 
        );
    }

    render () {
        return (
            <Carousel
                sliderWidth={screenWidth}
                sliderHeight={screenWidth}
                itemWidth={screenWidth - 60}
                data={this.state.filePath}
                renderItem={this._renderItem.bind(this)}
                hasParallaxImages={true}
            />
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
/*import react from 'react';
import { stylesheet, text, view } from 'react-native';
import { button, toast } from '@ant-design/react-native';
import { slider } from '@ant-design/react-native';

interface props {
    value: string;
}

interface states {

}

export default class home extends react.component<props, states> {
    constructor(props: props) {
        super(props);
    }

    render() {
        const {value}=this.props;
        return (<view>
            <text>{value}</text>
            <text>{value}</text>
            <text>{value}</text>
            <text>{value}</text>
            <text>{value}</text>
            <slider defaultvalue={0.5} />
            <button onpress={() => toast.info('toast test')}>
                start
            </button>
            <text>{value}</text>
        </view>);
    }
}*/
