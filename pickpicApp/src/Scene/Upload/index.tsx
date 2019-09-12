import { Modal, Button, Dimensions, StyleSheet, Image, View, Text, Platform, TouchableOpacity, TextInput, TouchableHighlight, Picker } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import React, { createRef } from 'react'
// import DatePicker from 'react-native-datepicker'
import moment from "moment";
import { NavigationEvents } from 'react-navigation';
const { width: screenWidth } = Dimensions.get('window')
import ActionSheet from 'react-native-actionsheet';
import GenderPermisson, { getPermissionLabel, getPermissionLables, getPermissionValue } from '../../Component/GenderPermission';



interface Props {
};
interface State {
  imageInfos: {
    image: any,
    index: number
  }[],
  title: string,
  expiredDate: Date,
  modalVisible: boolean,
  dateDurationAmount: any, //number로 하면 error 발생
  dateDurationUnit: string,
  genderPermission: GenderPermisson,
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
  ActionSheet = {
    option: null,
    gender: null,
  };

  constructor(props) {
    super(props);
    this.state = this.initState();
  }

  initState() {
    const durationAmount = 2;
    const durationUnit = "day";
    return {
      imageInfos: [{ image: null, index: 0 }],
      title: "Title을 입력해주세요.",
      expiredDate: moment().add(durationAmount, durationUnit).toDate(),
      modalVisible: false,
      dateDurationAmount: durationAmount,
      dateDurationUnit: durationUnit,
      genderPermission: GenderPermisson.ALL
    };
  }

  componentDidMount() {
    this.getPermissionAsync();
  }
  
  render() {
    let { imageInfos: imageInfos } = this.state;

    return (
      <View style={{ flex: 1 }}>
        {/* Upload 에서는 NavigationEvent를 두지 않고, 현재 상태 유지시킨다? */}
        <NavigationEvents />
        <View style={{ flex: 1, marginTop: 20 }}>
          <TextInput
            style={styles.title}
            onChangeText={(title) => this.setState({ title })}
            value={this.state.title}
          />
          <View style={{ flexDirection: 'row' }}>
            <Text style={[styles.text, { flex: 3 }]}>Expired {moment(this.state.expiredDate).fromNow()}</Text>
            <Text style={styles.text}>{getPermissionLabel(this.state.genderPermission)}</Text>
            {/* <Text onPress={this.showActionSheet}>Open ActionSheet</Text> */}
            <View style={{ flex: 1, alignItems: 'flex-end', paddingHorizontal: 15 }}>
              <Button title=":" onPress={() => this.showActionSheet('option')} />
            </View>
          </View>
          {this.optionsActionSheet}
          {this.genderActionSheet}
          {this.modalDatePicker}
        </View>

        <View style={{ height: screenWidth }}>
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
        </View>
        <View style={{ flex: 1, marginTop: 20 }}>
          {imageInfos &&
            <Button title="Event 생성" onPress={this.sendImage} />}
        </View>
      </View >
    );
  }

  /* ParallaxImage */
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


  /* ActionSheets */
  showActionSheet = (sheet: string) => {
    console.debug('show actionsheet ', sheet); 
    this.ActionSheet[sheet].show();
  }

  get optionsActionSheet() {
    return (<ActionSheet
      ref={sheet => this.ActionSheet.option = sheet}
      title={'Options'}
      options={['Expired ' + moment(this.state.expiredDate).fromNow(), getPermissionLabel(this.state.genderPermission), 'Cancel']}
      cancelButtonIndex={2}
      // destructiveButtonIndex={2}
      onPress={(index) => {
        if (index == 0)
          this.setState({ modalVisible: true })
        else if (index == 1)
          this.showActionSheet('gender');
      }}
    />);
  }

  get genderActionSheet() {
    let options = getPermissionLables();
    const cancelIdx = options.length;
    options.push('Cancel');

    return (<ActionSheet
      ref={sheet => this.ActionSheet.gender = sheet}
      title={'투표대상'}
      options={options}
      cancelButtonIndex={cancelIdx}
      // destructiveButtonIndex={cancelIdx}
      onPress={(index: GenderPermisson) => {
        if (index != cancelIdx)
          this.setState({ genderPermission: index });
      }}
    />);
  }

  /* Modal DatePicker */
  handleModalClose = () => {
    this.setState({
      modalVisible: false,
      expiredDate: moment().add(this.state.dateDurationAmount, this.state.dateDurationUnit).toDate(),
    });
  }
  
  setDuration = (dateDurationAmount, dateDurationUnit) => {
    this.setState({
      dateDurationAmount,
      dateDurationUnit
    });
  }

  get modalDatePicker() {
    let period = 10;
    switch (this.state.dateDurationUnit) {
      case "hour":
        period = 24;
        break;
      case "day":
        period = 31;
        break;
      case "week":
        period = 4;
        break;
    }

    let pickerItem = [];
    Array.from({ length: period }, (x, i) => pickerItem.push(<Picker.Item key={String(i + 1)} label={String(i + 1)} value={i + 1} />));
    console.debug(period, this.state.dateDurationUnit)

    return (
      <Modal
        animationType='slide'
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={this.handleModalClose}
      >
        <View style={[styles.overlay]}>
          <View style={[styles.modal]}>
            <View style={[styles.modalBtnContainer]}>
              <Button title="Done" onPress={this.handleModalClose} />
            </View>
            <View style={[{ flexDirection: 'row' }]}>
              <Picker
                selectedValue={this.state.dateDurationAmount}
                style={{ flex: 1 }}
                onValueChange={(itemValue, itemIndex) => this.setDuration(itemValue, this.state.dateDurationUnit)
                }>
                {pickerItem}
              </Picker>
              <Picker
                selectedValue={this.state.dateDurationUnit}
                style={{ flex: 1 }}
                onValueChange={(itemValue, itemIndex) => this.setDuration(this.state.dateDurationAmount, itemValue)
                }>
                <Picker.Item label="시간 뒤" value="hour" />
                <Picker.Item label="일 뒤" value="day" />
                <Picker.Item label="주 뒤" value="week" />
              </Picker>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  /* Permissions */
  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  /* Handling Images */
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
      formdata.append("genderPermission", getPermissionValue(this.state.genderPermission));
      formdata.append("expiredAt", this.state.expiredDate.toISOString());
      // console.debug(formdata);
      var response = await fetch(this.eventRoute, {
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formdata
      });

      console.debug(formdata);
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

  /* Deprecated */
  // snapToNext = () => {
  //   this.carouselRef.current.snapToNext();
  // }

  // snapToPrev = () => {
  //   this.carouselRef.current.snapToPrev();
  // }

  // get datePicker() {
  //   return <DatePicker
  //     style={{ width: 200 }}
  //     date={this.state.expiredDate}
  //     mode="datetime"
  //     placeholder="select date"
  //     format="YYYY-MM-DD HH:mm"
  //     minDate={this.state.minDate}
  //     maxDate={this.state.maxDate}
  //     confirmBtnText="Confirm"
  //     cancelBtnText="Cancel"
  //     locale="kor"
  //     customStyles={{
  //       dateInput: {
  //         marginLeft: 36
  //       }
  //       // ... You can check the source to find the other keys.
  //     }}
  //     onDateChange={(date) => {
  //       this.setState({ expiredDate: new Date(moment(date, 'YYYY-MM-DD HH:mm', true).format()) });
  //     }}
  //   />
  // }
}

const styles = StyleSheet.create({
  modal: { backgroundColor: '#fff', height: 300, width: '100%', margin: 0 },
  modalBtnContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    // marginTop: 15
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.3)',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  button: {
    width: screenWidth - 60,
    height: screenWidth - 60,
    opacity: 0.1
  },
  title: {
    // paddingHorizontal: 30,
    // backgroundColor: 'transparent',
    // color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  text: {
    margin: 10,
    fontSize: 14,
    textAlign: 'right'
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
})