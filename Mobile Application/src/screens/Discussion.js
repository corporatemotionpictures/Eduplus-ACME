
import React, { Component, useState } from 'react';
import { View,RefreshControl, TouchableOpacity, Image, AsyncStorage, Platform, Alert, FlatList, Modal, Picker, StyleSheet, TextInput } from 'react-native';
import { styles, Header, GRAD1, LIGHTGREY, WIDTH, LIGHT_GREY, GREEN, GREY, HEIGHT, GRAD2, BG_COLOR, LIGHT_BLUE, } from '../utils/utils';
import { createAppContainer, ScrollView } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import DiscussionLayout from '../utils/DiscussionLayout';
import TextArea from "react-native-textarea"
import { Ionicons, FontAwesome ,MaterialCommunityIcons,AntDesign,Feather} from "@expo/vector-icons"
import ImagePicker from "react-native-image-picker";
import { uploadPost, BASE_URL, fetchPosts, fetchComments, addComments, fetchSubjects } from '../utils/configs';
import Loader from '../utils/Loader';
import moment from 'moment';
import BlankError from '../utils/BlankError';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import LightBox from "react-native-lightbox";
import Lightbox from 'react-native-lightbox';
import Text from './components/CustomFontComponent'

let options = {
  title: 'Select Image',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};



class PhotoView extends Component {
    constructor(props) {
    super(props);
    this.state = {
      item: this.props.navigation.state.params.item
    };
  }

  render() {
    return (
      <Lightbox   onClose={() => this.props.navigation.goBack()}>
        <View style={{ padding: 5, marginLeft: heightPercentageToDP(5) }} >
          <Image style={{ height: "100%" , width:"100%", resizeMode:  "contain" }} source={{ uri: `${BASE_URL}${this.state.item.image}` }} />
        </View>
      </Lightbox>
    );
  }
}


class Feed extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: '',
      image: null,
      filePath: null,
      fileData: null,
      fileUri: null,
      fileName: null,
      fileType: null,
      id: null,
      posts: [],
      loading: true,
      editVisible: false,
      subjects: [],
      selectedSubject: null,
      offset: 0,
      loadingMore: false,
      filter:'All',
      userId:''
    };
  }

  onRefresh = () => {
    this.componentWillMount();
  }


  componentWillMount() {

    AsyncStorage.getItem("user_id").then(id =>{
      this.setState({userId:id})
    })
    AsyncStorage.getItem("user_token").then(token => {
      fetchPosts(token).then(data => {
        this.setState({
          posts: data.posts,
          loading: false
        })
      });

      fetchSubjects(token, this.state.offset).then(data => {
        this.setState({
          subjects: data.subjects
        })
        var items = [];
        this.state.subjects.map((item, index) => {
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

    });
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


  uploadPosts = () => {
    if (this.state.selectedSubject == null) {
      Alert.alert("Please select any subject");
      return;
    }
    this.setState({
      loading: true
    })
    if (this.state.query.length != 0) {
      AsyncStorage.getItem("user_token").then(token => {
        AsyncStorage.getItem("user_id").then(id => {
          uploadPost(token, this.state.query, this.state.selectedSubject).then(data => {
            console.log(data)
            this.setState({
              id: data.id
            });
            if (this.state.fileData != null) {
              this.handleUploadPhoto();
            } else {
              Alert.alert("Hurray", "Post Uploaded")
              this.setState({
                loading: false,
                editVisible: false
              })
            }
          })
        })
      })
    }
    else {
      alert("Please write something")
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
      fetch(`${BASE_URL}/api/v1/upload?field=posts&&id=${this.state.id}`, {
        method: "POST",
        headers: {
          'X-AUTH-TOKEN': token
        },
        body: this.createFormData(),
      })
        .then(response => response.json())
        .then(response => {
          Alert.alert("We Got it","")
          this.setState({
            loading: false,
            fileData: null,
            editVisible: false
          });
          console.log(response)
          this.componentWillMount()
        })
        .catch(error => {
          console.log("upload error", error);
          Alert.alert("Upload failed!");
        });
    })
  };


  renderPosts = ({ item, index }) => {
    

    if(item.subject_name == this.state.filter ){
        return (
          <DiscussionLayout data={item} onPress={() => this.props.navigation.navigate("Post", { data: item })} />
        )
    }else if(this.state.filter == "All"){
      return (
        <DiscussionLayout data={item} onPress={() => this.props.navigation.navigate("Post", { data: item })} />
      )
    }else if(this.state.userId == item.user_id  && this.state.filter == "My Posts" ){
      return (
        <DiscussionLayout data={item} onPress={() => this.props.navigation.navigate("Post", { data: item })} />
      )
    }
  }
  render() {



    return this.state.loading ? <Loader /> : (
      <View style={{
        flex: 1,
        backgroundColor: "white",
      }}>
        <Header title="Discussion" />
        <View>
          <ScrollView refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />} showsHorizontalScrollIndicator={false} horizontal style={{backgroundColor:'white',padding:heightPercentageToDP(1.5),flexDirection:'row',borderBottomColor:"#ececec",borderWidth:.5}}>
              <TouchableOpacity onPress={() => this.setState({filter:"All"})} style={{backgroundColor: this.state.filter == "All" ?  LIGHT_BLUE :'white' ,paddingVertical:heightPercentageToDP(1),paddingHorizontal:heightPercentageToDP(3),borderRadius:heightPercentageToDP(2),marginHorizontal:2,borderColor:this.state.filter != "All" ? GREY : LIGHT_BLUE,borderWidth:1}} >
                   <Text style={{fontFamily:'Roboto-Bold',color:this.state.filter == "All" ? "white" : GREY}}>All Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.setState({filter:"My Posts"})} style={{backgroundColor: this.state.filter == "My Posts" ?  LIGHT_BLUE :'white' ,paddingVertical:heightPercentageToDP(1),paddingHorizontal:heightPercentageToDP(3),borderRadius:heightPercentageToDP(2),marginHorizontal:2,borderColor:this.state.filter != "My Posts" ? GREY : LIGHT_BLUE,borderWidth:1}} >
                   <Text style={{fontFamily:'Roboto-Bold',color:this.state.filter == "My Posts" ? "white" : GREY }}>My Posts</Text>
                 </TouchableOpacity>
                <FlatList
                      showsHorizontalScrollIndicator={false}
                      horizontal
                      style={{
                      }}
                      data={this.state.subjects}
                      renderItem={({item,index}) =>{
                        return(
                      <TouchableOpacity onPress={() => this.setState({filter:item.name})} style={{backgroundColor: this.state.filter == item.name ?  LIGHT_BLUE :'white' ,paddingVertical:heightPercentageToDP(1),paddingHorizontal:heightPercentageToDP(3),borderRadius:heightPercentageToDP(2),marginHorizontal:2,borderColor:this.state.filter != item.name ?  GREY :LIGHT_BLUE  ,borderWidth:1}} >
                        <Text style={{fontFamily:'Roboto-Bold',color:this.state.filter == item.name ? "white" : GREY}}>{item.name}</Text>
                      </TouchableOpacity>
                        )
                      }}
                  />
          </ScrollView>
          </View>
        <View showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {
             this.state.posts.length == 0 ? 
              <BlankError text={"No Discussion Found"} /> : <FlatList
                style={{ flex: 1,backgroundColor:'white' }}
                data={this.state.posts}
                extraData={this.state.posts}
                renderItem={this.renderPosts}
              />
            }
          </View>
          <Modal visible={this.state.editVisible} onDismiss={() => this.setState({ editVisible: false })} onRequestClose={() => this.setState({ editVisible: false })} presentationStyle="fullScreen" animated animationType="slide">
            <View style={[styles.BG_STYLE,{backgroundColor:'white',padding:0}]}>
              <Header title="Create your post" backIcon={true} onbackIconPress={() => this.setState({ editVisible: false })} />
              <View style={Style.pickerWrapper}>
                <Picker
                  placeholder="Select your subject"
                  placeholderStyle={{ color: "black" }}
                  placeholderIconColor={"black"}
                  selectedValue={this.state.selectedSubject}
                  onValueChange={(itemValue, itemIndex) => {
                    this.setState({ selectedSubject: itemValue })
                    console.log(itemValue)
                  }
                  }
                >
                  <Picker.Item label={"Select any subject"} color={"black"} value={null} />
                  {
                    this.state.subjects.map((item, index) => {
                      return <Picker.Item label={item.name} color={"black"} value={item.id} />
                    })
                  }
                </Picker>
              </View>
              <View style={{ borderWidth: .2, borderColor: "white", borderRadius: 8, height: 160, marginTop: 10 }}>
                <TextArea
                  autoFocus
                  containerStyle={{ padding: 10, height: 100 }}
                  style={{ backgroundColor: "white", color: 'black', fontSize: 17 }}
                  onChangeText={(text) => this.setState({ query: text })}
                  placeholder={'Write Something here...'}
                  placeholderTextColor={"black"}
                  underlineColorAndroid={'transparent'}
                />
              </View>
              {this.state.fileData == null ?
                <TouchableOpacity onPress={this.chooseImage} style={{ height: 50, width: WIDTH - 10, padding: 10, alignItems: 'center', flexDirection: 'row', marginTop: 10, justifyContent: 'center' }}>
                  <Ionicons name="ios-add" color={"black"} size={30} style={{ paddingRight: 10 }} />
                  <Text style={{ color: "black", fontSize: 14, textAlign: 'center' }} >
                    Upload Image (Optional)
                </Text>
                </TouchableOpacity> :
                null
              }

              <View style={{ width: WIDTH - 15, overflow: 'hidden', justifyContent: "center", alignItems: 'center', marginTop: 20 }}>
                {this.state.fileData !== null ? <Image style={{ height: 150, width: WIDTH }} source={{ uri: 'data:image/jpeg;base64,' + this.state.fileData }} />
                  : null}
              </View>
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
              <TouchableOpacity onPress={this.uploadPosts} style={{ backgroundColor: GREEN, width: WIDTH, height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 5, position: 'absolute', bottom: 5 }}>
                <Text style={{ color: GREY, fontFamily:'Roboto-Bold', fontSize: 18 }}>SUBMIT</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
        <TouchableOpacity onPress={() => this.setState({ editVisible: true })} style={{ position: 'absolute', bottom: 10, right: 10, borderRadius: 25, height: 50, width: 50, backgroundColor: LIGHT_BLUE, justifyContent: 'center', alignItems: 'center' }}  >
          <FontAwesome name="edit" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  }
}


class Post extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: this.props.navigation.state.params.data,
      comments: [],
      commentText: '',
      commentId: null,
      loading: false,
      image: null,
      filePath: null,
      fileData: null,
      fileUri: null,
      fileName: null,
      fileType: null,
      lightbox: false
    };
  }

  componentDidMount() {
    console.log(this.state.data.id)
    AsyncStorage.getItem("user_token").then(token => {
      fetchComments(token, this.state.data.id).then(data => {
        this.setState({
          comments: data.comments
        });
        // console.log(data);
      });
    });
  }


  uploadPosts = () => {
    if (this.state.selectedSubject == null) {
      Alert.alert("Please select any subject");
      return;
    }
    this.setState({
      loading: true
    });
    if (this.state.query.length != 0) {
      AsyncStorage.getItem("user_token").then(token => {
        AsyncStorage.getItem("user_id").then(id => {
          uploadPost(token, this.state.query, this.state.selectedSubject).then(data => {
            this.setState({
              id: data.id
            });

          })
        })
      })
    }
    else {
      alert("Please write something")
    }
  }



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



  createFormData = () => {
    var data = new FormData();
    data.append("file", {
      name: this.state.fileName,
      type: this.state.fileType,
      uri: Platform.OS === "android" ? this.state.fileUri : this.state.fileUri.replace("file://", "")
    });
    return data;
  };

  handleUploadPhoto = () => {
    AsyncStorage.getItem("user_token").then((token) => {
      fetch(`${BASE_URL}/api/v1/upload?field=comments&id=${this.state.commentId}`, {
        method: "POST",
        headers: {
          'X-AUTH-TOKEN': token
        },
        body: this.createFormData(),
      })
        .then(response => response.json())
        .then(response => {
          Alert.alert("We Got it", "")
          this.setState({
            loading: false,
            fileData: null,
            editVisible: false
          });
          this.componentDidMount()
        })
        .catch(error => {
          console.log("upload error", error);
          Alert.alert("Upload failed!");
        });
    })
  };


  postComments = () => {
    if (this.state.commentText.length == 0) {
      Alert.alert("Please write something.")
      return
    }
    this.setState({ loading: true })
    AsyncStorage.getItem("user_token").then(token => {
      addComments(token, this.state.commentText, this.state.data.id).then(data => {
        this.setState({
          commentId: data.id,
        });

        if (this.state.fileData != null) {
          this.handleUploadPhoto();
        } else {
          this.componentDidMount()
          this.setState({
            loading: false,
          })
        }
      })
    });
  }

  renderComments({ item, index }) {
    if (index != 0) {
      if (item.user_id == this.state.comments[index - 1]["user_id"]) {
        return (
          <View style={{ marginBottom: 2, marginLeft: heightPercentageToDP(5) }} >
            <View style={{flexDirection:'row'}} >
            <View style={{  backgroundColor:'#ebebeb' ,borderRadius:heightPercentageToDP(.5),padding:heightPercentageToDP(1),maxWidth:widthPercentageToDP(80) }}>
              <Text style={{ color: 'black',  textAlign: 'left', fontSize: 14, backgroundColor:'#ebebeb',borderRadius:heightPercentageToDP(.5),paddingHorizontal:heightPercentageToDP(1),fontFamily:'Roboto-Regular' }} >{item.comment}</Text>
              <Text style={{ color: 'grey',  fontSize: 9,paddingHorizontal:heightPercentageToDP(1),paddingTop:heightPercentageToDP(1), fontFamily:'Roboto-Regular'}} >{moment(item.created_at).fromNow()}</Text>
            </View>
            </View>
            {
              item.image == null ? null :
                <Lightbox onClose={() => this.setState({lightbox:false})} onOpen={() => this.setState({lightbox:true})} style={{ padding: 5,}} >
                  <Image style={{ height: this.state.lightbox ?"100%":heightPercentageToDP(10), width:this.state.lightbox ? "100%": WIDTH / 1.5, borderRadius:this.state.lightbox ? 0 : 3,resizeMode:this.state.lightbox ? "contain" :'cover' }} source={{ uri: `${BASE_URL}${item.image}` }} />
                </Lightbox>
            }
          </View>
        )
      }
    }
    return (
      <TouchableOpacity style={{ marginBottom: 2, }} >
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', }}>
          <View style={{ flexDirection: 'row', padding: 2, }}>
            <View>
              {item.user_image != null ? <Image source={{ uri: `${BASE_URL}${item.user_image}` }} style={{ width: 20, height: 20, borderRadius: heightPercentageToDP(.5), backgroundColor: '#ececec', margin: 10 }} />
                :
              <Image source={require("../../assets/user-placeholder.png")} style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'white', margin: 10 }} />}</View>
              <View style={{ justifyContent: 'space-around' }}>
                <Text style={{ color: 'black', padding: 4, textAlign: 'left', fontSize: 13, fontFamily:'Roboto-Bold', marginTop: 5 }} numberOfLines={2}>{item.user_first_name}</Text>
              </View>
          </View>
        </View>
        <View style={{flexDirection:'row',marginLeft:widthPercentageToDP(10)}} >
            <View style={{  backgroundColor:'#ebebeb' ,borderRadius:heightPercentageToDP(.5),padding:heightPercentageToDP(1),maxWidth:widthPercentageToDP(80) }}>
              <Text style={{ color: 'black',  textAlign: 'left', fontSize: 14, backgroundColor:'#ebebeb',borderRadius:heightPercentageToDP(.5),paddingHorizontal:heightPercentageToDP(1),fontFamily:'Roboto-Regular' }} >{item.comment}</Text>
              <Text style={{ color: 'grey',  fontSize: 9,paddingHorizontal:heightPercentageToDP(1),paddingTop:heightPercentageToDP(1),fontFamily:'Roboto-Regular'}} >{moment(item.created_at).fromNow()}</Text>
            </View>
            </View>
        {item.image == null ? null :
       <Lightbox onClose={() => this.setState({lightbox:false})} onOpen={() => this.setState({lightbox:true})} style={{ padding: 5, marginLeft:heightPercentageToDP(5), }} >
          <Image style={{ height: this.state.lightbox ?"100%":heightPercentageToDP(10), width:this.state.lightbox ? "100%": WIDTH / 1.5, borderRadius:this.state.lightbox ? 0 : 3,resizeMode:this.state.lightbox ? "contain" :'cover' }} source={{ uri: `${BASE_URL}${item.image}` }} />
        </Lightbox>
  }
      </TouchableOpacity>
    )
  }

  render() {
    const { comments, image, body, user_first_name, user_last_name, user_image, subject_name, created_at } = this.state.data
    return this.state.loading ? <Loader /> : (
      <View style={{ flex: 1, backgroundColor: "white" }}>

        <Header title="Discussion" />
        <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 60 }} >
          <View style={{ overflow: 'hidden',backgroundColor:'white' }}>
            <View style={{ justifyContent: 'space-between', flexDirection: 'row', padding: 8, paddingLeft: 10, alignItems: 'center', }}>
                <Text style={{ color: 'black', padding: 5, textAlign: 'left', fontFamily:'Roboto-Bold',width:widthPercentageToDP(60),fontSize:heightPercentageToDP(2)}} numberOfLines={2}>{user_first_name} {user_last_name} </Text>
              <View style={{ flexDirection: "row", justifyContent: 'flex-end', padding: 8 ,alignItems:'center', fontFamily:'Roboto-Regular'}}>
              <Text style={{ color: 'black', textAlign: 'right', marginHorizontal: 10, fontFamily:'Roboto-Regular', alignItems: 'center',fontSize:heightPercentageToDP(1.2) }}>
                  {moment(created_at).fromNow()}
              </Text>
              <TouchableOpacity onPress={() => this.setState({liked:!this.state.liked})} style={{}}>
                <AntDesign name={this.state.liked ? "star" : "staro" } color={"gold"} size={heightPercentageToDP(2.5)} />
              </TouchableOpacity>
              </View>
            </View>
            <View style={{ justifyContent: 'space-between',marginRight:heightPercentageToDP(1.2) }}>
                <Text style={{ color: 'black', paddingHorizontal: 5, textAlign: 'left', fontFamily:'Roboto-Regular', marginHorizontal: 10 }}>{body}</Text>
           
            </View>
          </View>
          {
            image != null ?
              <Lightbox onClose={() => this.setState({ lightbox: false })} onOpen={() => this.setState({ lightbox: true })}  >
                <View style={{ overflow: 'hidden', marginTop: 8, height: this.state.lightbox ? HEIGHT : 300 }}>
                  <Image source={{ uri: `${BASE_URL}${image}` }} style={{ width: "100%", height: "100%", resizeMode: this.state.lightbox ? "contain" : "cover" }} />
                </View>
              </Lightbox>
              : null
          }
               <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:heightPercentageToDP(1.5),borderBottomColor:'#ececec',borderBottomWidth:.8,paddingBottom:10}}>
                      <Text numberOfLines={1} style={{ fontFamily:'Roboto-Regular',color: LIGHT_BLUE, backgroundColor: "#dbefff", fontSize: heightPercentageToDP(1.5), padding: 8, borderRadius: 4, textAlign: 'center', marginLeft: heightPercentageToDP(1.6), fontFamily: 'Roboto-Bold' ,}} adjustsFontSizeToFit >{subject_name}</Text>
                      <Text style={{fontFamily:'Roboto-Regular', color: 'grey', textAlign: 'right', margin: 10,  alignItems: 'center' }}><MaterialCommunityIcons name="comment" color="grey" size={heightPercentageToDP(2)} /> {this.state.comments.length}</Text>             
                </View>
          {/* <Text style={{ color: 'black', padding: widthPercentageToDP(4), fontSize: heightPercentageToDP(2),borderTopColor:"#283242",borderTopWidth:.8,borderBottomColor:"#ececec",borderBottomWidth:.9 }}>Comments</Text> */}
          {
            this.state.comments.length == 0 ?
              <View style={{ justifyContent: 'center', alignItems: 'center', margin: 20, }}>
                <Image source={require("../../assets/chat.png")} style={{width:100,height:100,resizeMode:'contain'}} />
                <Text style={{ color: 'black', fontSize: 18, fontFamily:'Roboto-Regular' }}>Be the first to comment here.</Text>
              </View> :
              this.state.comments.map((item, index) => {
                return this.renderComments({ item, index })
              })
          }
        </ScrollView>
        {this.state.fileData !== null ? <View style={{ position: 'absolute', bottom: 60, width: WIDTH / 2, backgroundColor: GRAD1, left: 0, right: 0, padding: 5, }} >
          <Image style={{ height: heightPercentageToDP(10), width: WIDTH / 2, borderRadius: 2 }} source={{ uri: 'data:image/jpeg;base64,' + this.state.fileData }} />
          <TouchableOpacity onPress={() => this.setState({ fileData: null })} style={{ position: 'absolute', top: -5, right: -10, borderRadius: widthPercentageToDP(2), height: widthPercentageToDP(4), width: widthPercentageToDP(4), backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' }} >
            <Ionicons name="ios-close" size={heightPercentageToDP(2)} color="white" />
          </TouchableOpacity>
        </View> : null}
        <View style={{ position: 'absolute', bottom: 2, flexDirection: 'row', height: 60, backgroundColor: "white", left: 0, right: 0, borderTopColor: LIGHTGREY, borderTopWidth: .5, padding: 5, flex: 1, alignItems: 'center', justifyContent: 'center' }}>

          <TouchableOpacity onPress={this.chooseImage} style={{ justifyContent: 'center', alignItems: 'center', margin: 10 }}>
            <Ionicons name="ios-images" size={heightPercentageToDP(3.7)} color={"grey"} />
          </TouchableOpacity>
            <TextInput
              style={{ backgroundColor: "white", color: 'black', fontSize:heightPercentageToDP(1.8), height: 40, borderRadius: 5, flex: 1 }}
              onChangeText={(text) => this.setState({ commentText: text })}
              placeholder={' Write your Comment here'}
              placeholderTextColor={'#c7c7c7'}
              underlineColorAndroid={'transparent'}
            />
            <TouchableOpacity onPress={this.postComments} style={{ justifyContent: 'center', alignItems: 'center', margin: 10 }}>
              {this.state.loading ? <ActivityIndicator size="small" color="white" /> : <Feather name="send" size={35} color={GREEN} />}
            </TouchableOpacity>
        </View>
      </View>
    );
  }
}




const Style = StyleSheet.create({
  pickerWrapper: {
    borderColor: "#ececec",
    borderWidth: .2,
    backgroundColor: "white",
    borderRadius: 4
  },
  pickerIcon: {
    color: GRAD1,
    position: "absolute",
    bottom: 15,
    right: 13,
    fontSize: 20,
    backgroundColor: LIGHTGREY,
    width: 20,
    height: 20,
    borderRadius: 10,

  },

  pickerContent: {
    color: "lightgrey",
    backgroundColor: "transparent",
  },
})


const Discussion = createStackNavigator({
  
  Feed: {
    screen: Feed,
    navigationOptions: {
      header: null
    },
  },
  Post: {
    screen: Post,
    navigationOptions: {
      header: null
    }
  },
})

export default createAppContainer(Discussion)
