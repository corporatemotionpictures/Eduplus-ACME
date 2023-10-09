import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Image, AsyncStorage, Platform, Alert, KeyboardAvoidingView, Picker, StyleSheet, ScrollView, FlatList } from 'react-native';
import { styles, Header, GREY, GREEN, LIGHTGREY, LIGHT_GREY, BG_COLOR, WIDTH, HEIGHT, GRAD1, BLUE, LIGHT_BLUE, ORANGE_NEW, NEW_GRAD1, NEW_GRAD2 } from '../utils/utils';
import HeadingText from '../utils/HeadingText';
import TextArea from "react-native-textarea"
import { Ionicons } from "@expo/vector-icons"
import ImagePicker from "react-native-image-picker"
import { sendUserQuery, BASE_URL, fetchSubjects, fetchEnquiry, fetchExams, fetchCourses, fetchChapters } from '../utils/configs';
import Loader from '../utils/Loader';
import moment from "moment"
import BlankError from '../utils/BlankError';
import LottieView from "lottie-react-native"
import PostThumbnail from '../utils/PostThumbnail';
import { LinearGradient } from "expo-linear-gradient"
import Lightbox from 'react-native-lightbox';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';

let options = {
  title: 'Select Image',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};


export default class QueryRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      image: '',
      filePath: null,
      fileData: null,
      fileUri: null,
      fileName: null,
      fileType: null,
      id: null,
      subjects: [],
      selectedSubject: null,
      selectedExam: null,
      selectedChapter: null,
      selectedCourse: null,
      visible: false,
      enquiries: [],
      loading: true,
      offset: 0,
      loadingMore: false,
      exams: [],
      courses: [],
      chapters: [],
      lightbox: false
    };
  }


  componentWillMount() {
    AsyncStorage.getItem("user_token").then((token) => {

      fetchSubjects(token, this.state.offset).then(data => {
        var items = [];
        data.subjects.map((item, index) => {
          const value = {
            id: item.id,
            name: item.name
          };
          items.push(value);
        })
        this.setState({
          subjects: items
        })
        this.loadMore()
      })
      fetchEnquiry(token).then(data => {
        console.log(data)
        this.setState({
          enquiries: data.enquiry,
          loading: false
        })
      })

      fetchExams(token, this.state.offset).then(data => {
        var items = [];
        data.exams.map((item, index) => {
          const value = {
            id: item.id,
            name: item.name
          };
          items.push(value);
        })
        this.setState({
          exams: items
        })
        this.loadMore()
      })


      fetchCourses(token, this.state.offset).then(data => {
        var items = [];
        data.courses.map((item, index) => {
          const value = {
            id: item.id,
            name: item.name
          };
          items.push(value);
        })
        this.setState({
          courses: items
        })
        this.loadMore()
      })


      fetchChapters(token, this.state.offset).then(data => {
        var items = [];
        data.chapters.map((item, index) => {
          const value = {
            id: item.id,
            name: item.name
          };
          items.push(value);
        })
        this.setState({
          chapters: items
        })
        this.loadMore()
      })
    })
  }


  fetchMore() {
    const offset = this.state.offset
    console.log(offset)
    fetchSubjects(this.state.token, offset).then(data => {
      if (data.subjects.length != 0) {
        var items = [];
        this.setState({
          subjects: [...this.state.subjects, ...data.subjects]
        })
        this.state.subjects.map((item, index) => {
          const value = {
            id: item.id,
            name: item.name
          };
          items.push(value);
        });

        this.setState({
          subjects: items
        })
        this.loadMore();
      } else {
        this.setState({
          loadingMore: false
        })
      }
    });
  }

  loadMore = () => {
    this.setState({
      offset: this.state.offset + 10,
      loadingMore: true
    }, () => {
      this.fetchMore()
    })
  }


  _renderFooter = () => {
    if (!this.state.loadingMore) return null;
    return (
      <View
        style={{
          position: "relative",
          width: "100%",
          height: 200,
          paddingVertical: 20,
          marginTop: 10,
          marginBottom: 10
        }}
      >
        <Loader />
      </View>
    );
  };



  chooseImage = async () => {
    await ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = { uri: response.uri };
        console.log(source)
        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        this.setState({
          filePath: response,
          fileData: response.data,
          fileUri: response.uri,
          fileName: response.fileName,
          fileType: response.type
        });
      }
    });
  }


  sendQuery = () => {
    console.log("EXAM" + this.state.selectedExam)
    console.log("SUBJECT" + this.state.selectedSubject)
    console.log("COURSE" + this.state.selectedCourse)
    console.log("CHAPTER" + this.state.selectedChapter)
    //console.log(this.state.fileData)
    if (this.state.selectedExam == null) {
      Alert.alert("Please select any Exam");
      return;
    }
    this.setState({
      loading: true
    });
    if (this.state.query != null) {
      AsyncStorage.getItem("user_token").then(token => {
        AsyncStorage.getItem("user_id").then(id => {
          sendUserQuery(token, this.state.query, this.state.selectedExam, this.state.selectedSubject, this.state.selectedCourse, this.state.selectedChapter).then(data => {
            this.setState({
              id: data.id,
            })
            if (this.state.fileData != null) {
              this.handleUploadPhoto();
            } else {
              Alert.alert("We got it!", "We will solve your issue soon")
              this.setState({
                loading: false
              });
              this.componentWillMount()
            }
          })
        })
      })
    } else {
      alert("Please write something In QueryBox");
    }
  }


  createFormData = () => {
    var data = new FormData();
    data.append("file", {
      name: this.state.fileName,
      type: this.state.fileType,
      uri: Platform.OS === "android" ? this.state.fileUri : this.state.fileUri.replace("file://", "")
    });

    console.log(data)
    return data;
  };

  handleUploadPhoto = () => {
    console.log(this.state.id)
    AsyncStorage.getItem("user_token").then((token) => {
      fetch(`${BASE_URL}/api/v1/upload?field=enquiries&&id=${this.state.id}`, {
        method: "POST",
        headers: {
          'X-AUTH-TOKEN': token
        },
        body: this.createFormData(),
      })
        .then(response => response.json())
        .then(response => {
          Alert.alert("We Got it", "We wil resolve your issue soon")
          this.setState({ fileData: null });
          this.setState({
            loading: false
          })
          console.log(response)
        })
        .catch(error => {
          console.log("upload error", error);
          Alert.alert("Upload failed!");
        });
    })
  };

  renderItem = ({ item, index }) => {
    return (
      <View style={{}}>
        <View style={{ flexDirection: 'row', padding: heightPercentageToDP(1.6), backgroundColor: '#ffffff' }}>
          <Image source={require("../../assets/comment.png")} style={{ width: widthPercentageToDP(9), height: widthPercentageToDP(9), marginTop: heightPercentageToDP(1) }} />
          <View style={{ marginHorizontal: heightPercentageToDP(1), marginLeft: 10, }} >
            <Text numberOfLines={4} style={{ flex: 1, fontSize: heightPercentageToDP(2), fontFamily: 'Roboto-Bold', width: widthPercentageToDP(78), color: '#393939', textAlign: 'justify' }} >{item.message}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: widthPercentageToDP(90), marginTop: heightPercentageToDP(.5) }} >
              {item.subject_name == null ? null :
                <Text numberOfLines={1} style={{ backgroundColor: "#dbefff", padding: 5, color: GREEN, borderRadius: 4, textAlign: 'center', fontSize: heightPercentageToDP(1.5), width: widthPercentageToDP(30), fontFamily: 'Roboto-Regular', }} >{item.subject_name}</Text>
              }
              {item.exam_name == null ? null :
                <Text numberOfLines={1} style={{ backgroundColor: "#dbefff", padding: 5, color: GREEN, borderRadius: 4, textAlign: 'center', fontSize: heightPercentageToDP(1.5), marginRight: 60, width: widthPercentageToDP(20), fontFamily: 'Roboto-Regular', }} >{item.exam_name}</Text>
              }
              <Text numberOfLines={1} style={{ color: 'lightgrey', fontSize: heightPercentageToDP(1.4), marginRight: 5, width: widthPercentageToDP(20) }}>{moment(item.created_at).fromNow()}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', }}>
              </View>
            </View>
          </View>
        </View>

        {/* <Image source={require("../../../assets/comment.png")} style={{ width: WIDTH, height: 150, flex: 1, borderRadius:.4 }} /> */}
        {
          item.image != null ?
            <Lightbox activeProps={activeProps} onClose={() => this.setState({ lightbox: false })} onOpen={() => this.setState({ lightbox: true })} style={{ padding: 5, }} >
              <Image source={{ uri: `${BASE_URL}${item.image}` }} style={{ width: widthPercentageToDP(90), resizeMode: 'cover', justifyContent: 'center', alignItems: 'center', height: 150, borderRadius: 5 }} />
            </Lightbox>
            : null
        }

        {/* <View style={{ flexDirection: 'row', padding: 8, marginTop: 1, marginRight: 20, height: 50, justifyContent: 'space-between', borderTopColor: "#f1f1f1", borderTopWidth: .1, alignItems: 'center', margin: 10, marginBottom: 0 }}>
          {
            item.subject_name != null ?
              <Text style={{ color: 'white', fontSize: 12, textAlign: 'right', backgroundColor: GREEN, borderRadius: 3, padding: 5, paddingLeft: 2, alignItems: 'center', }}> {item.subject_name} </Text>
              : null
          }
           </View> */}
        {/* <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
            <View style={{ flexDirection: 'row', justifyContent:'space-between' }}>
            <Text style={{color:LIGHTGREY,padding:5,textAlign:'left',fontSize:heightPercentageToDP(2), fontFamily:'Roboto-Regular'}} numberOfLines={2}>Neeraj Soni </Text>
              <Text style={{ color: 'black', padding: 5, textAlign: 'right', fontSize: 10, borderRadius: 8, padding: 5, alignItems: 'center', }}> {moment(item.created_at).fromNow()} </Text>
            </View>
          </TouchableOpacity> */}

        {item.reply == null ? null :
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: widthPercentageToDP(100), marginTop: heightPercentageToDP(.5) }} >
            <Image source={require("../../assets/icon.png")} style={{ width: 20, height: 20, borderRadius: 10, marginLeft: 10 }} />
            {item.replied_user == null ? null :
              <Text style={{ flex: 1, color: LIGHTGREY, padding: 5, textAlign: 'left', fontSize: heightPercentageToDP(1.7), fontFamily: 'Roboto-Regular', marginLeft: 10, }} numberOfLines={1}>{item.replied_user}</Text>
            }
            {item.replied_time == null ? null :
              <Text style={{ flex: 1, color: 'lightgrey', textAlign: 'right', justifyContent: 'flex-end', alignContent: 'flex-end', fontSize: heightPercentageToDP(1.4), right: 10 }}>{moment(item.replied_time).fromNow()}</Text>
            }
          </View>
        }

        {item.reply !== null ? <View style={{ width: WIDTH, flexDirection: 'column', alignItems: 'center' }}>
          {/* <Image source={require("../../../assets/icon.png")} style={{ width: 30, height: 30, borderRadius: 15 }} /> */}
          <Text style={{ color: 'black', width: widthPercentageToDP(95), margin: 10, fontSize: heightPercentageToDP(1.5), textAlign: 'justify' }}>{item.reply}</Text>
          {item.image_for_user == null ? null :
            // <Image source={{ uri: `${BASE_URL}${item.image_for_user}` }} style={{ width: widthPercentageToDP(90), resizeMode:'cover', justifyContent:'center', alignItems:'center', height: 150, borderRadius:5 }} />
            <Lightbox underlayColor="white" activeProps={activeProps} onClose={() => this.setState({ lightbox: false })} onOpen={() => this.setState({ lightbox: true })} style={{ padding: 5, }} >
              <Image source={{ uri: `${BASE_URL}${item.image_for_user}` }} style={{ width: widthPercentageToDP(90), resizeMode: 'cover', justifyContent: 'center', alignItems: 'center', height: 150, borderRadius: 5 }} />
            </Lightbox>
          }
        </View> :
          null
        }
        <View
          style={{
            borderBottomColor: "#DCDCDC",
            borderBottomWidth: .2,
            marginTop: 5
          }}
        />
      </View>
    )
  }

  render() {
    return this.state.loading ? <Loader /> : (
      <View style={{ backgroundColor: "white", flex: 1 }}>
        <Header title="Ask Your Doubt" backIcon={true} onbackIconPress={() => this.props.navigation.goBack()} />
        <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1, marginBottom: 100 }}>
          <KeyboardAvoidingView style={{ flex: 1, }}>
            <Image source={require('../../assets/ayd-min.jpg')} style={{ width: "100%", marginBottom: -50, resizeMode: 'contain', marginTop: -50 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
              <View style={[Style.pickerWrapper, { width: widthPercentageToDP(45) }]}>
                <Picker
                  placeholder="Select Exam"
                  placeholderStyle={{ color: "white" }}
                  placeholderIconColor={"white"}
                  textStyle={{ fontSize: 10 }}
                  style={{ margin: 5, height: heightPercentageToDP(5), fontSize: 10 }}
                  selectedValue={this.state.selectedExam}
                  mode="dropdown"
                  onValueChange={(itemValue, itemIndex) => {
                    this.setState({ selectedExam: itemValue })
                  }}>
                  <Picker.Item label={"Select Exam"} fontSize={10} color={LIGHTGREY} value={null} />
                  {
                    this.state.exams.map((item, index) => {
                      return <Picker.Item label={item.name} color={LIGHTGREY} value={item.id} />
                    })
                  }
                  {/* {this.state.loadingMore ? this._renderFooter() : null} */}
                </Picker>
              </View>
              <View style={[Style.pickerWrapper, { width: widthPercentageToDP(45) }]}>
                <Picker
                  placeholder="Select Course"
                  placeholderStyle={{ color: "white", }}
                  placeholderIconColor={"white"}
                  mode="dropdown"
                  style={{ margin: 5, height: heightPercentageToDP(5) }}
                  selectedValue={this.state.selectedCourse}
                  onValueChange={(itemValue, itemIndex) => {
                    this.setState({ selectedCourse: itemValue })
                  }}>

                  <Picker.Item label={"Select Course"} color={LIGHTGREY} value={null} />
                  {
                    this.state.courses.map((item, index) => {
                      return <Picker.Item label={item.name} color={LIGHTGREY} value={item.id} />
                    })
                  }
                  {/* {this.state.loadingMore ? this._renderFooter() : null} */}
                </Picker>
              </View>

            </View>

            <View style={Style.pickerWrapper}>
              <Picker
                placeholder="Select Subject"
                placeholderStyle={{ color: "white", }}
                placeholderIconColor={"white"}
                style={{ margin: 5, height: heightPercentageToDP(5) }}
                mode="dropdown"
                selectedValue={this.state.selectedSubject}
                onValueChange={(itemValue, itemIndex) => {
                  this.setState({ selectedSubject: itemValue })
                  console.log(itemValue)
                }}>
                <Picker.Item label={"Select Subject"} color={LIGHTGREY} value={null} />
                {
                  this.state.subjects.map((item, index) => {
                    return <Picker.Item label={item.name} color={LIGHTGREY} value={item.id} />
                  })
                }
                {/* {this.state.loadingMore ? this._renderFooter() : null} */}
              </Picker>
            </View>
            <View style={Style.pickerWrapper}>

              <Picker
                placeholder="Select Chapter"
                placeholderStyle={{ color: "white", }}
                placeholderIconColor={"white"}
                style={{ margin: 5, height: heightPercentageToDP(5) }}
                mode="dropdown"
                selectedValue={this.state.selectedChapter}
                onValueChange={(itemValue, itemIndex) => {
                  this.setState({ selectedChapter: itemValue })
                }}>
                <Picker.Item label={"Select Chapter"} color={LIGHTGREY} value={null} />
                {
                  this.state.chapters.map((item, index) => {
                    return <Picker.Item label={item.name} color={LIGHTGREY} value={item.id} />
                  })
                }
                {/* {this.state.loadingMore ? this._renderFooter() : null} */}
              </Picker>
            </View>


            <View style={{ borderColor: LIGHTGREY, borderWidth: .5, borderRadius: 5, padding: 10, marginTop: 10, marginHorizontal: 10 }}>
              <TextArea
                style={{ backgroundColor: "white", color: LIGHTGREY, fontSize: 17 }}
                onChangeText={(text) => this.setState({ query: text })}
                maxLength={120}
                placeholder={'Type your doubt here...'}
                placeholderTextColor={LIGHTGREY}
                underlineColorAndroid={'transparent'}
                autoFocus
              />
            </View>
            <TouchableOpacity onPress={this.chooseImage} style={{ width: WIDTH - 8, justifyContent: "center", overflow: 'hidden', alignItems: 'center', marginTop: 10, marginRight: 10, padding: 8 }}>
              {
                this.state.fileData != null ? <Image style={{ width: WIDTH - 20, height: 150, borderRadius: 10 }} source={{ uri: 'data:image/jpeg;base64,' + this.state.fileData }} />
                  : <View style={{ flexDirection: 'row' }} >
                    <HeadingText text="Upload Image (Optional)" />
                    <Ionicons name="ios-camera" size={30} color={LIGHTGREY} />
                  </View>
              }
              {
                this.state.fileData !== null ?
                  <TouchableOpacity style={{ height: 50, width: WIDTH - 10, padding: 10, alignItems: 'center', flexDirection: 'row', marginTop: 10, justifyContent: 'space-around' }}>
                    <Text onPress={this.chooseImage} style={{ color: LIGHTGREY, alignItems: 'center', justifyContent: 'space-around', }}>
                      <Text >Change Image   </Text>
                      <Ionicons onPress={this.chooseImage} name="ios-add" color={LIGHT_GREY} size={20} style={{ marginTop: 15 }} />

                    </Text>
                    <Text onPress={() => this.setState({ fileData: null })} style={{ color: LIGHTGREY, alignItems: 'center', justifyContent: 'space-around', }}>
                      <Text>Remove Image   </Text>
                      <Ionicons name="ios-close" color={LIGHT_GREY} size={20} style={{ marginTop: 15 }} />

                    </Text>
                  </TouchableOpacity>
                  : null
              }
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </ScrollView>


        <TouchableOpacity onPress={this.sendQuery} style={{ backgroundColor: "#FB6E39", width: WIDTH - 10, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, position: 'absolute', bottom: 5, alignSelf: 'center' }}>
          <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 8 }} >
            <Text numberOfLines={2} style={{ fontFamily: 'Roboto-Regular', color: 'white', fontSize: 18, margin: 10, }}>
              SUBMIT
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <Modal animated animationType="slide" presentationStyle="fullScreen" visible={this.state.visible} onDismiss={() => this.setState({ visible: false })} onRequestClose={() => this.setState({ visible: false })} >
          <View style={{ flex: 1, backgroundColor: "white", }}>
            <Header backIcon={true} onbackIconPress={() => this.setState({ visible: false })} title="All Enquiries" />
            {this.state.loading ? <Loader /> : (this.state.enquiries.length != 0 ?
              <FlatList
                data={this.state.enquiries}
                renderItem={this.renderItem}
              />
              :
              <BlankError text="You haven't asked anything to us! Tap on + bnutton to ask your doubt" />)}
          </View>
        </Modal>
      </View>
    );
  }
}


const Style = StyleSheet.create({
  pickerWrapper: {
    borderColor: LIGHTGREY,
    borderWidth: .2,
    backgroundColor: "white",
    borderRadius: 4,
    margin: 10
  },
  pickerIcon: {
    color: BG_COLOR,
    position: "absolute",
    bottom: 15,
    right: 13,
    fontSize: 20,
    backgroundColor: "white",
    width: 20,
    height: 20,
    borderRadius: 10,

  },

  pickerContent: {
    color: "lightgrey",
    backgroundColor: "transparent",
  },
})
