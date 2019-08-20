import * as React from 'react';
import { Button, Image, View, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { any } from 'prop-types';

interface Props {

}

interface State {
  imageInfos: { image:any, index:number }[];
}

interface ImageFile extends Blob {
  name:string;
  type:string;
  uri:string;
  size:null;
  slice:null;
}
export default class Upload extends React.Component<Props, State>{
  state:State = { imageInfos: [] }; 

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
      var filename = imageInfo.image.uri.substring(imageInfo.image.uri.lastIndexOf('/')+1);
      var uploadx:ImageFile = {uri:imageInfo.image.uri, name:filename, type:'image/jpeg', size:null, slice:null} ;
      // console.debug(blobImage2);
      formdata.append( "userfile", uploadx);
    }

    formdata.append("owner", "bakyuns");
    console.debug(formdata);
    fetch('http://127.0.0.1:3000/events/', {
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        body: formdata
    }).then(response => {
        console.log("image uploaded")
    }).catch(err => {
        console.log(err)
    });
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
          this.state.imageInfos.map(imageInfo => (<Image key={imageInfo.index} source={{ uri: imageInfo.image.uri }} style={{ width: 200, height: 200 }} />))
        }
        {imageInfos &&
          <Button title="Send to Node.js" onPress={()=>this.sendImage()}/> }
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
      const images = this.state.imageInfos.concat({image:result, index:length});
      this.setState({ imageInfos: images });
    }
  };
  
}