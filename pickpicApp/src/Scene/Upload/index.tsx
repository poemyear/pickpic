import { Button, Dimensions, StyleSheet, Image, View, Text, Platform, TouchableOpacity, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import React, { createRef } from 'react'
import DatePicker from 'react-native-datepicker'
import moment from "moment";

const { width: screenWidth } = Dimensions.get('window')

interface Props {
};
interface State {
  imageInfos: {
    image: any,
    index: number
  }[],
  title: string,
  expiredDate: Date,
  minDate: Date,
  maxDate: Date
}

interface ImageFile extends Blob {
  name: string;
  type: string;
  uri: string;
  size: null;
  slice: null;
}

export default class Upload extends React.Component<Props, State>{
  carouselRef = createRef<Carousel>();
  serverAddress = "http://localhost:3000";
  eventRoute = this.serverAddress + "/events";

  constructor(props) {
    super(props);
    this.state = this.initState();
  }

  initState() {
    let minDate = new Date();
    let maxDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    maxDate.setDate(minDate.getDate() + 12);
    const state =
    {
      imageInfos: [{ image: null, index: 0 }],
      title: "Title을 입력해주세요.",
      expiredDate: minDate,
      minDate: minDate,
      maxDate: maxDate,
    };
    console.log(minDate);
    return state;
  }

  snapToNext = () => {
    this.carouselRef.current.snapToNext();
  }

  snapToPrev = () => {
    this.carouselRef.current.snapToPrev();
  }

  sendImage = async () => {
    let { imageInfos: images } = this.state;
    const formdata = new FormData();

    if (images.length < 3) {
      alert("사진을 2장이상 선택해 주세요.");
      return;
    }


    images = images.slice(1, images.length); // detach add button 
    for (let imageInfo of images) {
      let uri = imageInfo.image.uri;
      var filename = uri.substring(uri.lastIndexOf('/') + 1);
      var upload: ImageFile = { uri: uri, name: filename, type: 'image/jpeg', size: null, slice: null };
      formdata.append("userfile", upload);
    }

    try {
      formdata.append("owner", "bakyuns");
      formdata.append("title", this.state.title);
      formdata.append("expiredAt", this.state.expiredDate.toISOString());
      // console.debug(formdata);
      var response = await fetch(this.eventRoute, {
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formdata
      });

      if (!response.ok) {
        console.error("ERROR: " + response.statusText);
        throw Error(response.statusText);
      }

      var responseJson = await response.json();
      const id = responseJson._id;
      console.debug('responseJson', responseJson);
      console.log('image uploaded. id: ', id);
      alert("Event 생성 완료: " + id);

      this.setState(this.initState());
    } catch (err) {
      console.error(err);
    }
  }

  _renderItem = ({ item, index }, parallaxProps) => {

    if (index == 0) { // add button
      return (
        <View style={styles.item}>
          <TouchableOpacity style={styles.button} onPress={this._pickImage}>
            <ParallaxImage
              source={require('../../Component/addButton.png')}
              containerStyle={styles.imageContainer}
              style={styles.image}
              parallaxFactor={0}
              {...parallaxProps}
            />
          </TouchableOpacity>
        </View>
      );
    }
    else
      return (
        <View style={styles.item}>
          <ParallaxImage
            source={{ uri: item.image.uri }}
            containerStyle={styles.imageContainer}
            style={styles.image}
            parallaxFactor={0.4}
            {...parallaxProps}
          />
        </View>
      );
  }

  render() {
    let { imageInfos: imageInfos } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TextInput
          style={styles.title}
          onChangeText={(title) => this.setState({ title })}
          value={this.state.title}
        />
        <DatePicker
          style={{ width: 200 }}
          date={this.state.expiredDate}
          mode="datetime"
          placeholder="select date"
          format="YYYY-MM-DD HH:mm"
          minDate={this.state.minDate}
          maxDate={this.state.maxDate}
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          locale="kor"
          customStyles={{
            dateInput: {
              marginLeft: 36
            }
            // ... You can check the source to find the other keys.
          }}
          onDateChange={(date) => {
            this.setState({ expiredDate: new Date(moment(date, 'YYYY-MM-DD HH:mm', true).format()) });
          }}
        />

        <Carousel
          ref={this.carouselRef}
          layout={'stack'}
          sliderWidth={screenWidth}
          sliderHeight={screenWidth}
          itemWidth={screenWidth - 60}
          data={imageInfos} //{this.state.events[this.state.eventIdx].photos}
          renderItem={this._renderItem}
          hasParallaxImages={true}
        />
        {imageInfos &&
          <Button title="Event 생성" onPress={this.sendImage} />}
      </View>
    );

  }
  componentDidMount() {
    this.getPermissionAsync();
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      const length = this.state.imageInfos.length;
      let images = [];
      if (length > 1) // not first image
        images = this.state.imageInfos.slice(1, length);
      images.unshift({ image: result, index: length });
      images.unshift({ image: null, index: length + 1 });
      this.setState({ imageInfos: images });
    }
  };

}

const styles = StyleSheet.create({
  button: {
    width: screenWidth - 60,
    height: screenWidth - 60,
    opacity: 0.1
  },
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
    width: screenWidth - 60,
    paddingHorizontal: 30,
    backgroundColor: 'transparent',
    // color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
})