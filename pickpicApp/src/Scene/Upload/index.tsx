import * as React from 'react';
import { Button, Image, View, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { any } from 'prop-types';


interface Props {
};
interface State {
  imageInfos: { image: any, index: number }[];
}

interface ImageFile extends Blob {
  name: string;
  type: string;
  uri: string;
  size: null;
  slice: null;
}
export default class Upload extends React.Component<Props, State>{
  state: State = { imageInfos: [] };
  serverAddress = "http://localhost:3000";
  eventRoute = this.serverAddress + "/events";

  constructor(props) {
    super(props);

    this.state = {
      imageInfos: []
    }
  }

  sendImage = async () => {
    let { imageInfos: images } = this.state;
    const formdata = new FormData();
    var reader = new FileReader();

    for (let imageInfo of images) {
      let uri = imageInfo.image.uri;
      var filename = uri.substring(uri.lastIndexOf('/') + 1);
      var upload: ImageFile = { uri: uri, name: filename, type: 'image/jpeg', size: null, slice: null };
      // console.debug(blobImage2);
      formdata.append("userfile", upload);
    }

    try {
      formdata.append("owner", "bakyuns");
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

    } catch (err) {
      console.error(err);
    }
  }

  render() {
    let { imageInfos: imageInfos } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          title="Pick an image from camera roll"
          onPress={this._pickImage}
        />
        {
          imageInfos &&
          //  this.renderImages(images)
          this.state.imageInfos.map(imageInfo => (
            <Image key={imageInfo.index} source={{ uri: imageInfo.image.uri }} style={{ width: 200, height: 200 }} />))
        }
        {imageInfos &&
          <Button title="Send to Node.js" onPress={this.sendImage} />}
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

    console.log(result);

    if (!result.cancelled) {
      const length = this.state.imageInfos.length;
      const images = this.state.imageInfos.concat({ image: result, index: length });
      this.setState({ imageInfos: images });
    }
  };

}