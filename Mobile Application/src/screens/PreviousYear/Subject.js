import React, { Component } from 'react';
import { View, Text, FlatList, Image, ScrollView, AsyncStorage, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { styles, Header, LIGHTGREY, GREEN, WIDTH, BLUE, BG_COLOR, LIGHTGREY1, FOREGROUND_COLOR, LIGHT_BLUE, NEW_GRAD2, NEW_GRAD1 } from '../../utils/utils';
import Thumbnail from '../../utils/Thumbnail';
import HeadingText from '../../utils/HeadingText';
import { fetchSubjects, BASE_URL, fetchChapters, fetchEnquiry } from '../../utils/configs';
import Loader from '../../utils/Loader';
import BlankError from '../../utils/BlankError';
import Background from '../../utils/Background';
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import AwesomeAlert from "react-native-awesome-alerts"
import DocumentLoader from '../../utils/DocumentLoader';
import PostThumbnail from '../../utils/PostThumbnail';
import Lightbox from 'react-native-lightbox';
import moment from "moment"
import ContentLoader, { Rect, Circle, Facebook, Instagram } from 'react-content-loader/native'
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';

const activeProps = {
  resizeMode: 'contain',
  flex: 1,
  width: null,
  backgroundColor: '#0000003b',
  opacity: 0.7
};

export default class Subject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subjects: [],
      loading: true,
      loadingMore: false,
      offset: 0,
      chapters: [],
      questions: [],
      enquiries: [],
      packageLocked: false,
      lightbox: false
    };
  }

  onRefresh = () => {
    this.componentDidMount();
  }


  componentDidMount() {
    AsyncStorage.getItem('course_name').then((coursename) => this.setState({ coursename: coursename }))
    AsyncStorage.getItem("user_token")
      .then(token => {
        fetchSubjects(token, this.state.offset).then(data => {
          this.setState({
            subjects: data.subjects,
            loading: false
          });
          console.log(data)
        })
        fetchChapters(token, this.state.offset).then(data => {
          this.setState({
            chapters: data.chapters,
            loading: false
          })
        })
        fetchEnquiry(token).then(data => {
          console.log(data)
          this.setState({
            enquiries: data.enquiry,
            loading: false
          })
        })
      })
  }

  renderList = ({ item, index }) => {


    return item.locked ? (
      <View style={{ height: 100, width: 100, borderRadius: 10, margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
        <TouchableOpacity onPress={() => {
          this.setState({ searchModal: false, packageLocked: true })
        }} style={{ flex: 1, height: 80, width: 80, borderRadius: 10, paddingTop: 0, }}>
          <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: 100, height: 100, }} />
          <LinearGradient colors={['transparent', 'transparent',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: 100, width: 120 }} >
            {/* <Text style={{ color: 'black', fontSize: 8, margin: 10, width: 100, position: 'absolute', bottom: 2 }}>
                  {item.name}
                </Text> */}
          </LinearGradient>
        </TouchableOpacity>
        <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="md-lock" size={35} color="white" />
          {/* <Image source={require("../../assets/play-button-min.png")} style={{width:40,height:40,resizeMode:'contain'}} /> */}
        </View>
      </View>
    ) : (
      <View style={{ height: 100, width: 100, borderRadius: 10, margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
        <TouchableOpacity onPress={() => {
          this.setState({ searchModal: false })
          this.props.navigation.navigate("AllChapters", { item: item })
        }} style={{ flex: 1, height: 80, width: 80, borderRadius: 10, paddingTop: 0, }}>
          <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: 100, height: 100, }} />
          <LinearGradient colors={['transparent', 'transparent',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: 100, width: 120 }} >
            {/* <Text style={{ color: 'black', fontSize: 10, margin: 10, width: 100, position: 'absolute', bottom: 4 }}>
                  {item.name}
                </Text> */}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    )
  }

  loadMore = () => {
    this.setState({
      offset: this.state.offset + 10,
      loadingMore: true
    }, () => {
      this.fetchMore()
    })
  }

  fetchMore = () => {
    const offset = this.state.offset
    console.log(offset)
    fetchSubjects(this.state.coursesID, offset).then(data => {
      if (data.subjects.length != 0) {
        this.setState({
          subjects: [...this.state.subjects, ...data.subjects],
          loadingMore: false
        })
      } else {
        this.setState({
          // subjects:[...this.state.subjects,data.subjects],
          loadingMore: false
        })
      }
    });
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
      </View>
    );
  };

  renderItem = ({ item, index }) => {
    return (
      <View style={{}}>
        <View style={{ flexDirection: 'row', padding: heightPercentageToDP(1.6), backgroundColor: '#ffffff' }}>
          <Image source={require("../../../assets/comment.png")} style={{ width: widthPercentageToDP(9), height: widthPercentageToDP(9), marginTop: heightPercentageToDP(1) }} />
          <View style={{ marginHorizontal: heightPercentageToDP(1), marginLeft: 10, }} >
            <Text numberOfLines={4} style={{ flex:1, fontSize: heightPercentageToDP(2), fontFamily: 'Roboto-Bold', width: widthPercentageToDP(78), color: '#393939', textAlign: 'justify' }} >{item.message}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: widthPercentageToDP(90), marginTop: heightPercentageToDP(.5) }} >
              {item.subject_name == null ? null:
              <Text numberOfLines={1} style={{ backgroundColor: "#dbefff", padding: 5, color: GREEN, borderRadius: 4, textAlign: 'center', fontSize: heightPercentageToDP(1.5), width: widthPercentageToDP(30), fontFamily: 'Roboto-Regular', }} >{item.subject_name}</Text>
              }
              {item.exam_name == null? null :
              <Text numberOfLines={1} style={{ backgroundColor: "#dbefff", padding: 5, color: GREEN, borderRadius: 4, textAlign: 'center', fontSize: heightPercentageToDP(1.5), marginRight: 60, width: widthPercentageToDP(20), fontFamily: 'Roboto-Regular', }} >{item.exam_name}</Text>
              }
              <Text numberOfLines={1} style={{ color: 'lightgrey', fontSize: heightPercentageToDP(1.4), marginRight: 5,width: widthPercentageToDP(20) }}>{moment(item.created_at).fromNow()}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', }}>
              </View>
            </View>
          </View>
        </View>

        {/* <Image source={require("../../../assets/comment.png")} style={{ width: WIDTH, height: 150, flex: 1, borderRadius:.4 }} /> */}
        {
          item.image != null ?
          <Lightbox renderHeader={close => (
            <TouchableOpacity onPress={close}>
              <Text style={{color: 'white',textAlign: 'center',margin: 10,alignSelf: 'flex-end', fontSize:heightPercentageToDP(2), padding:10}}>X</Text>
            </TouchableOpacity>
          )} underlayColor={'transparent'} activeProps = {activeProps} onClose={() => this.setState({lightbox:false})} onOpen={() => this.setState({lightbox:true})} style={{ padding: 5,}} >
            <Image source={{ uri: `${BASE_URL}${item.image}` }} style={{ width: widthPercentageToDP(95), resizeMode:'cover', justifyContent:'center', alignItems:'center', marginLeft:2, height: 150, borderRadius:5 }} />
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
          
        {item.reply == null ? null:
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: widthPercentageToDP(100), marginTop: heightPercentageToDP(.5) }} > 
          <Image source={require("../../../assets/icon.png")} style={{ width: 20, height: 20, borderRadius: 10, marginLeft:10}} />
          {item.replied_user == null ? null :
          <Text style={{ flex:1, color: LIGHTGREY, padding: 5, textAlign: 'left', fontSize: heightPercentageToDP(1.7), fontFamily: 'Roboto-Regular', marginLeft:10,}} numberOfLines={1}>{item.replied_user}</Text>
          }
          {item.replied_time == null ? null : 
          <Text style={{ flex:1, color: 'lightgrey',textAlign:'right', justifyContent:'flex-end', alignContent:'flex-end', fontSize: heightPercentageToDP(1.4), right:10 }}>{moment(item.replied_time).fromNow()}</Text>
          }
          </View>
        }

        {item.reply !== null ? <View style={{ width: WIDTH, flexDirection: 'column', alignItems: 'center' }}>
          {/* <Image source={require("../../../assets/icon.png")} style={{ width: 30, height: 30, borderRadius: 15 }} /> */}
          <Text style={{ color: 'black', width: widthPercentageToDP(95), margin: 10, fontSize: heightPercentageToDP(1.5), textAlign:'justify' }}>{item.reply}</Text>
          {item.image_for_user == null ? null :
          // <Image source={{ uri: `${BASE_URL}${item.image_for_user}` }} style={{ width: widthPercentageToDP(90), resizeMode:'cover', justifyContent:'center', alignItems:'center', height: 150, borderRadius:5 }} />
          <Lightbox  renderHeader={close => (
            <TouchableOpacity onPress={close}>
              <Text style={{color: 'white',textAlign: 'center',margin: 10,alignSelf: 'flex-end', fontSize:heightPercentageToDP(2), padding:10}}>X</Text>
            </TouchableOpacity>
          )} underlayColor="white" activeProps = {activeProps} onClose={() => this.setState({lightbox:false})} onOpen={() => this.setState({lightbox:true})} style={{ padding: 5,}} >
              <Image source={{ uri: `${BASE_URL}${item.image_for_user}` }} style={{ width: widthPercentageToDP(95), resizeMode:'cover', justifyContent:'center', alignItems:'center', height: 150, borderRadius:5 }} />
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

  renderChapters = ({ item, index }) => {
    return item.locked ? null : (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("PreviousYear", { item: item })} style={{ margin: 5, borderBottomColor: "#DCDCDC", borderBottomWidth: .2, flexDirection: 'row', justifyContent: 'space-between', padding: 5 }} >
        <View>
          <Text numberOfLines={2} style={{ color: 'black', fontSize: 15, width: widthPercentageToDP(75), fontFamily: 'Roboto-Regular' }}>{item.name}</Text>
          <View style={{ flexDirection: 'row', }}>
            <Text numberOfLines={1} style={{ backgroundColor: "#dbefff", padding: 5, color: GREEN, borderRadius: 4, textAlign: 'center', marginTop: 5, fontSize: 10, }}>{this.state.coursename}</Text>
          </View>
        </View>
        <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', paddingBottom: 15 }}>
          <Ionicons name="ios-arrow-forward" size={20} color="grey" />
        </View>
      </TouchableOpacity>
    )
  }


  renderQuestion = ({ item, index }) => {
    return item.locked ? null : (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("PreviousYear", { item: item })} style={{ height: 60, margin: 10, borderBottomColor: "#DCDCDC", borderBottomWidth: .2, flexDirection: 'row', justifyContent: 'space-between' }} >
        <View>
          <Text numberOfLines={2} style={{ color: 'black', fontSize: 15, width: 280, }}>{item.name}</Text>
        </View>
        <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', paddingBottom: 15 }}>
          <Ionicons name="ios-arrow-forward" size={20} color="grey" />
        </View>
      </TouchableOpacity>
    )
  }


  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Header title="Chats" />
        {this.state.loading ? <Loader /> : 
        <ScrollView refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />}>
          {this.state.enquiries.length == 0 ? null :
            <View style={{ width: widthPercentageToDP(100), backgroundColor: "#f1f1f1", height: 30, marginTop: 2 }}>
              <Text style={{ fontSize: heightPercentageToDP(1.5), marginTop: 8, fontFamily: 'Roboto-Regular', color: "#8b8b8b", textAlign: 'left', marginLeft: 10, justifyContent: 'center', alignContent: 'center', alignItems: 'center', }} >MESSAGE ({this.state.enquiries.length})</Text>
            </View>
            
          }
          {this.state.loading ? <Loader /> : (this.state.enquiries.length != 0 ?
            
            <FlatList
              data={this.state.enquiries}
              renderItem={this.renderItem}
            />
            :
            <View style={{justifyContent:'center', alignContent:'center', alignSelf:'center', alignItems:'center', flex:1}}>
            <BlankError text="You haven't asked anything to us!"
            text2="Tap on + button to ask your doubt"
            />
            </View>
            )}
        </ScrollView>
        }

      {this.state.loading ? null :
    <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{position: 'absolute', bottom: 20, right: 20, height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2}} >
        <TouchableOpacity onPress={() => this.props.navigation.navigate("QueryRoom")}  >
              <View style={{  }} >
                <Entypo name="plus" size={24} color="white" />
              </View>
              </TouchableOpacity>
        </LinearGradient>
  }
      </View>
    );
  }
}
