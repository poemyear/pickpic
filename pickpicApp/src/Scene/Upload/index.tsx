import { Button, Dimensions, StyleSheet, Image, View, Text, Platform, TouchableOpacity, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import React, { createRef } from 'react'

const { width: screenWidth } = Dimensions.get('window')

interface Props {
};
interface State {
  imageInfos: {
    image: any,
    index: number
  }[],
  title: string
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
  state: State = { imageInfos: [], title: "" };
  serverAddress = "http://localhost:3000";
  eventRoute = this.serverAddress + "/events";
  addButtonImage = { uri: this.serverAddress + "/upload/addButton.png" };

  constructor(props) {
    super(props);

    this.state = {
      imageInfos: [{ image: this.addButtonImage, index: 0 }],
      title: "Title을 입력해주세요."
    }
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
    var reader = new FileReader();

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
      this.setState({
        imageInfos: [{ image: this.addButtonImage, index: 0 }]
      });
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
              source={{ uri: item.image.uri }}
              containerStyle={styles.imageContainer}
              style={styles.image}
              parallaxFactor={0.4}
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
          style={{ height: 40, width:screenWidth-60 }}
          onChangeText={(title) => this.setState({ title })}
          value={this.state.title}
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
        <Button
          title={'Next'}
          onPress={this.snapToNext} />
        <Button
          title={'Prev'}
          onPress={this.snapToPrev} />
        {/* <Image source={require('../../../components/addButton.png')} style={{ width: 200, height: 200 }} /> */}
        {/* {
          imageInfos &&
          // this.renderImages(images)
          this.state.imageInfos.map(imageInfo => (
            <Image key={imageInfo.index} source={{ uri: imageInfo.image.uri }} style={{ width: 200, height: 200 }} />))
        } */}
        {imageInfos &&
          <Button title="생성" onPress={this.sendImage} />}
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
      images.unshift({ image: this.addButtonImage, index: length + 1 });
      this.setState({ imageInfos: images });
    }
  };

}

const styles = StyleSheet.create({
  button: {
    width: screenWidth - 60,
    height: screenWidth - 60,
    opacity: 0.7
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
    paddingHorizontal: 30,
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
})