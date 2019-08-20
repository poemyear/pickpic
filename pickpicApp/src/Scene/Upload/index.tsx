import * as React from 'react';
import { Button, Image, View, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { any } from 'prop-types';

interface Props {

}

interface State {
  image: any; 
}

export default class Upload extends React.Component<ProcessingInstruction, State>{
  state:State = { image : null };

  sendImage(){
    let { image } = this.state; 
    const formdata = new FormData();

    var uploadImage = new File(image.uri, image.name);

    formdata.append( "userfile", uploadImage );
    formdata.append("owner", "bakyuns");

    fetch('http://172.20.10.9:3000/events/', {
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
    let { image } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          title="Pick an image from camera roll"
          onPress={this._pickImage}
        />
        {image &&
           <Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />
        }
        {image &&
          <Button title="Send to Node.js" onPress={()=>this.sendImage}/> }
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
      this.setState({ image: result });
    }
  };
  
}