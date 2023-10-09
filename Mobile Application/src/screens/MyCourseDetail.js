import React, { Component } from 'react';
import { View, Image, TouchableOpacity, ScrollView, StyleSheet, AsyncStorage, TouchableHighlight, FlatList, Alert, TextInput, Picker, Style, ActivityIndicator, RefreshControl } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, removeOrientationListener, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { BG_COLOR, BLUE, Header, LIGHTGREY, LIGHTGREY1, GREEN, WIDTH, LIGHT_BLUE, NEW_GRAD1, NEW_GRAD2, LIGHT_GREEN, GRAD1, GRAD2, TAB_ICON_COLOR } from '../utils/utils';
import { Container, Tab, Tabs, ScrollableTab } from 'native-base';
import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import { Block, Icon } from 'galio-framework';
import { BASE_URL, fetchCourses, fetchSingleCourses, fetchSubjects, fetchSubject, fetchNotifications, fetchLiveClass, fetchMyCourseDetails, fetchProductDetails, addToCart, addReview } from '../utils/configs';
import { List } from "react-native-paper"
import Loader from '../utils/Loader';
import LinearGradient from 'react-native-linear-gradient';
import { NavigationEvents } from 'react-navigation';
import SelectableItems from './components/SelectableItems';
import ZoomUs, { ZoomEmitter } from 'react-native-zoom-us';
import Rating from './components/Rating';
import ContentLoader, { Rect, Circle, Facebook, Instagram } from 'react-content-loader/native'
import WebView from "react-native-webview"
import Textarea from 'react-native-textarea';
import HeadingText from '../utils/HeadingText';
import CourseSubject from './components/CourseSubject';
const regex = /(<([^>]+)>)/ig;
import moment from "moment"
import LottieView from "lottie-react-native";
import Text from './components/CustomFontComponent'
const FOREGROUND_COLOR = "lightgrey"

const ZOOM_APP_KEY = "8zYYkMHGGhpEDhQw0iGX8VxlIiDuLqCs94b9";   // zoom sdk keys
const ZOOM_APP_SECRET = "Rcq9aIhKzzqQY1vkbzYmg20RAy5FJ3cEs3O6";  // zoom app_secrert sdk keys
const ZOOM_JWT_APP_KEY = "";   // zoom jwt_app_keys
const ZOOM_JWT_APP_SECRET = "";  // zoom jwt_app_secret_keys


export default class MyCourseDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: this.props.navigation.state.params.item,
      loading: true,
      tab: 1,
      loadingTrack: false,
      quantity: '',
      getValue: '',
      selectedCompatibility: '',
      selectedLangauge: '',
      selectedValidity: '',
      productAttributes: '',
      productdetails: '',
      selectedAttributes: [],
      PickerQuantityHolder: 0,
      seeMore: false,
      Default_Rating: 2,
      Max_Rating: 5,
      review: '',
      writemessage: '',
      reviewloading: false,
      reamingdate: "0",
      loadingMore: false,
      packageLocked: false,
      offset: 0,
      subjects: [],
      liveclass: [],
      pickerItem: "[]"
    };

    console.log("COURSE ID")
    console.log(this.state.item)

    this.Star = 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/star_filled.png';
    this.Star_With_Border = 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/star_corner.png';
  }

  onRefresh = () => {
    this.componentWillMount();
    this.componentDidMount();
  }

  componentDidMount() {
    this.zoomAuth();
    AsyncStorage.getItem("user_id").then(id => {
      AsyncStorage.getItem("user_token").then(token => {
        fetchNotifications(token, this.state.item).then(data => {
          if (data.success) {
            this.setState({
              notifications: data.pushNotifications,
              //loading: false
            })
            //console.log(this.state.notifications)
          }
        })

        fetchLiveClass(token, this.state.item).then(video => {
          if (video.success) {
            this.setState({
              liveclass: video.events,
              //loading: false
            })
            // console.log("LIVE LECTURES")
            // console.log(this.state.liveclass)
          }
        })

        setInterval(() => {
          fetchLiveClass(token, this.state.item).then(video => {
            if (video.success) {
              this.setState({
                liveclass: video.events,
                loading: false
              })
              console.log("LIVE LECTURES")
              console.log(this.state.liveclass)
            }
          })
        }, 15000)

      })
    })

    // this.timer = setInterval(() => this.tokenExpirtTime(), 30000)

  }

  zoomAuth = async () => {
    await fetch(`${BASE_URL}/api/v1/settings/zoomAuth`, {
      method: "GET",
      headers: {
        'X-AUTH-TOKEN': await AsyncStorage.getItem('user_token')
      }
    })
      .then(response => response.json())
      .then((response) => {
        this.setState({
          zoomappkey: response.value.sdkApiKey,
          zoomappsecret: response.value.sdkApiSecret
        })

      })
      .catch(err => {
        console.error(err);
        Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
      });
    this.zoominit();
  }

  zoominit = async () => {
    console.log("ZOOM INITIALIZATION")
    console.log(this.state.zoomappkey)
    console.log(this.state.zoomappsecret)
    const res = await ZoomUs.initialize({
      clientKey: this.state.zoomappkey,
      clientSecret: this.state.zoomappsecret,
    })
    console.log(res)
  }

  joinmeeting = async (zoomid, zoompassword) => {
    // initialize with extra config
    // Join Meeting
    console.log(zoomid, zoompassword)
    const res2 = await ZoomUs.joinMeeting({
      userName: await AsyncStorage.getItem('user_name'),
      meetingNumber: zoomid,
      password: zoompassword,
    })
    console.log(res2)
  }


  componentWillMount = async () => {
    //this.componentDidMount()
    this.daysBefore()
    console.log("PRODUCT ID")
    console.log(this.state.item)
    AsyncStorage.setItem("product_id1", JSON.stringify(this.state.item));
    AsyncStorage.getItem("user_token").then(token => {
      this.setState({
        token: token
      })
      fetchSubjects(token, this.state.offset).then(data => {
        this.setState({
          subjects: data.subjects,
          loading: false
        });
        //console.log(data)
      })
      fetchMyCourseDetails(this.state.item, token)
        .then(res => {
          if (res.success) {
            this.setState({
              //loading: false,
              productref: res.productRef,
              productinfo: res,
              productdetails: res.userProducts,
              loading: false
              //productAttributes: res.product.attributes,
              //loadingMore: false
            }, () => {
              //console.log("MYCOURSEDETAILS Value", this.state.productinfo)
            })
            //console.log("ASDFGDFGHJ>>>>>>>>>>>>>>>>>")
            //console.log(res)
            console.log("MYCOURSEDETAILS")
            console.log(this.state.productdetails.length)
          }
        })
    })
  }

  daysBefore = async () => {
    await fetch(`${BASE_URL}/api/v1/settings/upgradeOrderDaysBefore`, {
      method: "GET",
      headers: {}
    })
      .then(response => response.json())
      .then((response) => {
        console.log("DAYS BEFORE")
        //console.log(response)
        //console.log(response.value)
        if ("0" == "0") {
          this.setState({
            value: true,
            reamingdate: "0"
          })
        } else {
          this.setState({
            value: false
          })
        }
      })
      .catch(err => {
        //console.error(err);
      });
  }


  handleTab = (val) => {
    this.setState({
      tab: val
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
    //console.log(offset)
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


  renderAnnouncement = ({ item, index }) => {
    var a = new Date(item.created_at);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = (a.getHours() + 24) % 12 || 12;
    var ampm = hour >= 12 ? 'PM' : 'AM';
    var min = a.getMinutes();
    var time = date + ' ' + month + ' ' + year + ' ' + '/' + ' ' + hour + ' ' + ':' + min + ' ' + ampm;
    return (
      <View style={styles.card} >
        <View style={{ flexDirection: 'column' }}>
          {/* <View style={{ width: widthPercentageToDP(100), backgroundColor: "#f1f1f1", height: 30, marginTop: 2 }}>
            <Text style={{ fontSize: heightPercentageToDP(1.5), marginTop: 8, fontFamily: 'Roboto-Regular', color: "#8b8b8b", textAlign: 'left', marginLeft: 10, justifyContent: 'center', alignContent: 'center', alignItems: 'center', }} >{time}</Text>
          </View> */}
          <View style={{ flexDirection: 'row', padding: heightPercentageToDP(1.6), backgroundColor: '#ffffff', borderBottomColor: "#DCDCDC", borderBottomWidth: .3 }}>
            <Image source={require("../../assets/notification.png")} style={{ width: widthPercentageToDP(6), height: widthPercentageToDP(6), marginTop: heightPercentageToDP(1) }} />
            <View style={{ marginHorizontal: heightPercentageToDP(1), marginLeft: 20, }} >
              <Text numberOfLines={2} style={{ fontSize: heightPercentageToDP(2), fontFamily: 'Roboto-Bold', width: widthPercentageToDP(78), color: '#393939' }} >{item.title}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: widthPercentageToDP(90), marginTop: heightPercentageToDP(.5) }} >
                <Text numberOfLines={4} style={{ fontSize: heightPercentageToDP(1.5), width: widthPercentageToDP(78), fontFamily: 'Roboto-Bold', color: "grey" }} >{item.body}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                  {/* <Status status={notifyData.appointment.status} />*/}
                </View>
              </View>
              <Text style={{ color: 'lightgrey', fontSize: heightPercentageToDP(1.4), marginTop: 4 }}>{time}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  renderLiveClass = ({ item, index }) => {
    var a = new Date(item.schedule_at);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = (a.getHours() + 24) % 12 || 12;
    var ampm = hour >= 12 ? 'PM' : 'AM';
    var min = a.getMinutes();
    var time = date + ' ' + month + ' ' + year + ' ' + '/' + ' ' + hour + ' ' + ':' + min + ' ' + ampm;
    var meetingtime = hour + ' ' + ':' + min + ' ' + ampm;
    console.log("ZOOM MEETING TIME")
    console.log(meetingtime)

    // var a = new Date();
    // var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // var year = a.getFullYear();
    // var month = months[a.getMonth()];
    // var date = a.getDate();
    // var hour = (a.getHours() + 24) % 12 || 12;
    // var ampm = hour >= 12 ? 'PM' : 'AM';
    // var min = a.getMinutes();
    // var time = date + ' ' + month + ' ' + year + ' ' + '/' + ' ' + hour + ' ' + ':' + min + ' ' + ampm;
    // var currenttime =  hour + ' ' + ':' + min + ' ' + ampm;
    // console.log("CURRENT TIME")
    // console.log(currenttime)
    return (
      <>
        {item.event_status == "ENDED" ? null : (
          <View style={styles.container1}>
            <View style={styles.row}>
              <Image style={{ width: widthPercentageToDP(30), height: 100, borderRadius: 4 }} source={{ uri: `${BASE_URL}${item.thumbnail}` }} />
              {item.event_status == "STARTED" ?
                <View style={styles.streaming}>
                  <Text style={styles.streamingText}>Streaming Now</Text>
                </View>
                : null}
              <View style={styles.inner}>
                <Text style={styles.time}>
                  {moment(item.schedule_at).format('DD MMM YYYY, h:mm a')}
                </Text>
                <Text numberOfLines={2} style={styles.title}  >
                  {item.title}
                </Text>
                <Text numberOfLines={2} style={styles.caption} >
                  {item.description}
                </Text>

                <View style={{ position: 'absolute', bottom: 0 }}>
                  {item.event_status == "STARTED" ?
                    <View style={{
                      opacity: item.event_status == "STARTED" ? 1 : .5, backgroundColor: "#4BB543",
                      width: widthPercentageToDP(60),
                      borderRadius: 4,
                      padding: heightPercentageToDP(1),
                    }}>
                      {item.base_type == "ZOOM" ?
                        <TouchableOpacity onPress={() => this.joinmeeting(item.zoom_id, item.zoomDetails.password)}>
                          <Text style={styles.join}>JOIN NOW</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("YoutubeLive", { item: item.youtube_link, itemtitle: item.title, itemdesc: item.description })}>
                          <Text style={styles.join}>JOIN NOW</Text>
                        </TouchableOpacity>
                      }
                    </View>
                    : null}
                  {item.event_status == "NOT_STARTED" ?
                    <View style={{
                      opacity: item.event_status == "STARTED" ? 1 : .5, backgroundColor: "#4BB543",
                      width: widthPercentageToDP(60),
                      borderRadius: 4,
                      padding: heightPercentageToDP(1),
                    }}>
                      <TouchableOpacity>
                        <Text style={styles.join}>
                          NOT STARTED
                        </Text>
                      </TouchableOpacity>
                    </View>
                    : null}
                  {/* {item.event_status == "NOT_STARTED"  ?
                 <View style={{ opacity: item.event_status == "STARTED" ? 1 : .5, backgroundColor: BLUE,
                 width: widthPercentageToDP(60),
                 justifyContent: 'center',
                 alignItems: 'center',
                 borderRadius: 4,
                 padding: heightPercentageToDP(1),
                 marginTop: 5 }}>
               <TouchableOpacity>
                   <Text style={styles.join}>
                     NOT STARTED
                   </Text>
               </TouchableOpacity>
               </View>
                 :null} */}
                  {item.event_status == "ENDED" ?
                    <View style={{
                      backgroundColor: 'red',
                      width: widthPercentageToDP(60),
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 4,
                      padding: heightPercentageToDP(1),
                    }}>
                      <TouchableOpacity>
                        <Text style={styles.join}>
                          CLASS ENDED
                        </Text>
                      </TouchableOpacity>
                    </View>
                    : null}
                </View>
              </View>
            </View>
          </View>

        )}
      </>
    )

  }


  _renderView() {
    return (
      <View
        style={{
          borderBottomColor: LIGHTGREY,
          borderBottomWidth: .5,
          marginTop: 10
        }}
      />
    )
  }

  render() {
    return this.state.loading ? <Loader /> : (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {this.state.productdetails.length == 0 || this.state.productdetails == undefined ?
          <Header title="Course Detail" backIcon onbackIconPress={() => this.props.navigation.goBack()} />
          :
          <Header title={this.state.productdetails[0].name} backIcon onbackIconPress={() => this.props.navigation.goBack()} />
        }
        <ScrollView refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />}>
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text numberOfLines={2} style={{ color: LIGHTGREY, marginHorizontal: heightPercentageToDP(2.5), marginTop: heightPercentageToDP(2), fontSize: heightPercentageToDP(3), fontFamily: 'Roboto-Bold', width: widthPercentageToDP(60), }}>{this.state.productdetails[0].name}</Text>
              <View style={{ marginTop: 10, right: 20 }}>
                {this.state.productdetails.length == 0 || this.state.productdetails == undefined ? null :
                  <Text numberOfLines={1} style={{ backgroundColor: "#03A2E829", borderRadius: 4, marginRight: 20, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', textAlign: 'right', padding: 6, width: widthPercentageToDP(30), color: '#07A1E8', fontFamily: 'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginTop: 10, textAlign: 'center' }}>
                    {this.state.productdetails[0].product_type.title}
                  </Text>}
                {this.state.value == true ? <View style={{}}>

                  <Text numberOfLines={1} style={{ backgroundColor: "#4BB543", borderRadius: 4, marginRight: 20, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', padding: 6, width: widthPercentageToDP(30), color: '#ffffff', fontFamily: 'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginTop: 10, textAlign: 'center' }}>{this.state.productref.leftDays} Days Left</Text>

                </View> :
                  <View style={{}}>

                    <Text numberOfLines={1} style={{ backgroundColor: "red", borderRadius: 4, marginRight: 20, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', padding: 6, width: widthPercentageToDP(30), color: '#ffffff', fontFamily: 'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginTop: 10, textAlign: 'center' }}>{this.state.productref.leftDays} Days Left</Text>

                  </View>}
              </View>
            </View>

            {/* <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {this.state.productdetails.length == 0 || this.state.productdetails == undefined ? null :
                  <Text numberOfLines={2} style={{ color: LIGHTGREY, marginHorizontal: heightPercentageToDP(2.5), marginTop: heightPercentageToDP(2), fontSize: heightPercentageToDP(3), fontFamily: 'Roboto-Bold', width: widthPercentageToDP(50) }}>{this.state.productdetails[0].name}</Text>
                }
                {this.state.productdetails.length == 0 || this.state.productdetails == undefined ? null :
                  <Text numberOfLines={1} style={{ backgroundColor: "#03A2E829", borderRadius: 4, marginRight: 20, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', padding: 6, width: widthPercentageToDP(30), color: '#07A1E8', fontFamily: 'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginTop: 10, textAlign: 'center' }}>
                    {this.state.productdetails[0].product_type.title}
                  </Text>}
              </View>
            </View> */}
            {/* <Text numberOfLines={2} style={{ color: LIGHTGREY, marginHorizontal: heightPercentageToDP(2), marginTop: heightPercentageToDP(2), fontSize: heightPercentageToDP(2) }}>My Course</Text> */}

            {/* {this.state.value == true ? <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text numberOfLines={2} style={{ color: LIGHTGREY, marginHorizontal: heightPercentageToDP(2), marginTop: heightPercentageToDP(2), fontSize: heightPercentageToDP(1.5) }}></Text>

              <Text numberOfLines={2} style={{ backgroundColor: "#4BB543", borderRadius: 4, marginRight: 20, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', padding: 6, width: widthPercentageToDP(30), color: '#ffffff', fontFamily: 'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginTop: 10, textAlign: 'center' }}>{this.state.productref.leftDays} Days Left</Text>

            </View> :
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text numberOfLines={2} style={{ color: LIGHTGREY, marginHorizontal: heightPercentageToDP(2), marginTop: heightPercentageToDP(2), fontSize: heightPercentageToDP(1.5) }}></Text>

                <Text numberOfLines={2} style={{ backgroundColor: "red", borderRadius: 4, marginRight: 20, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', padding: 6, width: widthPercentageToDP(30), color: '#ffffff', fontFamily: 'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginTop: 10, textAlign: 'center' }}>{this.state.productref.leftDays} Days Left</Text>

              </View>} */}

            {this.state.value == "0" ?
              <TouchableOpacity onPress={() => this.props.navigation.push("Home")}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text numberOfLines={2} style={{ color: LIGHTGREY, marginHorizontal: heightPercentageToDP(2), marginTop: heightPercentageToDP(2), fontSize: heightPercentageToDP(1.5) }}></Text>
                  <Text numberOfLines={2} style={{ backgroundColor: "red", borderRadius: 4, marginRight: 20, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', padding: 6, width: widthPercentageToDP(30), color: '#ffffff', fontFamily: 'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginTop: 10, textAlign: 'center' }}>Upgrade Now</Text>
                </View>
              </TouchableOpacity>
              : null}

            {/* <HeadingText text="SUBJECTS" />
          {this.state.loading ? <ActivityIndicator size={"large"} color={BLUE} /> :
            (this.state.subjects.length != 0 ?
              <View style={{ flex: 1 }}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListFooterComponent={this._renderFooter}
                  onEndReachedThreshold={.5}
                  onEndReached={this.loadMore}
                  style={{ flex: 1 }}
                  data={this.state.subjects}
                  renderItem={this.renderList}
                />
              </View>
              :
              <View style={{ height: 130, marginVertical: 10, marginTop: -10 }}>
                <ScrollView horizontal style={{ marginTop: 10, height: 100 }} showsHorizontalScrollIndicator={false}>
                  <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                    <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                      <Rect width={120} height={100} />
                    </ContentLoader>
                  </View>

                  <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                    <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                      <Rect width={120} height={100} />
                    </ContentLoader>
                  </View>

                  <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                    <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                      <Rect width={120} height={100} />
                    </ContentLoader>
                  </View>

                  <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                    <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                      <Rect width={120} height={100} />
                    </ContentLoader>
                  </View>

                </ScrollView>
              </View>
            )} */}

            <View
              style={{
                borderBottomColor: "#DCDCDC",
                borderBottomWidth: .3,
                shadowColor: "#000000",
                shadowOffset: 1,
                marginTop: 10
              }}
            />
          </View>


          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ marginTop: -10 }}>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginTop: 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomColor: "#DCDCDC", borderBottomWidth: .3 }}>
                  <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("1")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "1" ? 4 : .4, borderBottomColor: this.state.tab == "1" ? GREEN : "#DCDCDC", padding: 0, paddingTop: this.state.tab == "1" ? 12 : 12 }}>
                    <Text allowFontScaling={false} style={{ color: this.state.tab == "1" ? "black" : "grey", fontSize: heightPercentageToDP(1.5), fontFamily: 'Roboto-Regular', padding: 15, }} >LECTURES</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("2")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "2" ? 4 : .4, borderBottomColor: this.state.tab == "2" ? GREEN : "#DCDCDC", padding: 0, paddingTop: this.state.tab == "2" ? 12 : 12 }}>
                    <Text style={{ color: this.state.tab == "2" ? "black" : "grey", fontSize: heightPercentageToDP(1.5), fontFamily: 'Roboto-Regular', padding: 15, }}>ANNOUNCEMENTS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("3")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "3" ? 4 : .4, borderBottomColor: this.state.tab == "3" ? GREEN : "#DCDCDC", padding: 0, paddingTop: this.state.tab == "3" ? 12 : 12 }}>
                    <Text style={{ color: this.state.tab == "3" ? "black" : "grey", fontSize: heightPercentageToDP(1.5), fontFamily: 'Roboto-Regular', padding: 15, }}>STUDY MATERIAL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("4")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "4" ? 4 : .4, borderBottomColor: this.state.tab == "4" ? GREEN : "#DCDCDC", padding: 0, paddingTop: this.state.tab == "4" ? 12 : 12 }}>
                    <Text style={{ color: this.state.tab == "4" ? "black" : "grey", fontSize: heightPercentageToDP(1.5), fontFamily: 'Roboto-Regular', padding: 15, }}>LIVE CLASSES</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={{ flex: 1 }} >
            {
              this.state.tab == "3" ?
                <ScrollView style={{ flex: 1, width: this.state.videoWidth, backgroundColor: 'transparent', }}>
                  {
                    (
                      this.state.productdetails[0].courses.map((coursesdetail, index) => {
                        return (
                          <List.Accordion style={{ backgroundColor: "white", borderRadius: 8, borderBottomWidth: .5, borderBottomColor: '#DCDCDC' }} titleStyle={{ color: "black", fontFamily: 'Roboto-Regular', fontSize: heightPercentageToDP(2) }} title={coursesdetail.name}>
                            {this.state.productdetails == undefined || this.state.productdetails[0].courses.length == 0 ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: heightPercentageToDP("15%") }}><ActivityIndicator size="large" color={NEW_GRAD2} /></View> :
                              (
                                coursesdetail.subjects.map((chapter, index) => {
                                  return (
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("AllChapters", { item: chapter })} style={{ borderBottomWidth: .6, borderBottomColor: "#DCDCDC" }}>
                                      <Text style={{ marginTop: 10, marginLeft: 10, marginBottom: 10, padding: 10, fontSize: heightPercentageToDP(2), color: 'black', fontFamily: 'Roboto-Regular' }}>{chapter.name}</Text>
                                    </TouchableOpacity>
                                  )
                                })
                              )
                            }
                          </List.Accordion>
                        )
                      })
                    )
                  }
                </ScrollView>
                :
                <View>

                </View>
            }
          </View>


          {this.state.productdetails == undefined ? null :
            <View style={{ flex: 1 }} >
              {
                this.state.tab == "1" ?
                  <ScrollView style={{ flex: 1, width: this.state.videoWidth, backgroundColor: 'transparent', }}>
                    {
                      (
                        this.state.productdetails[0].courses.map((coursesdetail, index) => {
                          // console.log("COURSES SUBJECT LIST")
                          // console.log(coursesdetail.subjects)
                          return (
                            <List.Accordion style={{ backgroundColor: "white", borderRadius: 8, borderBottomWidth: .5, borderBottomColor: '#DCDCDC' }} titleStyle={{ color: "black", fontFamily: 'Roboto-Regular', fontSize: heightPercentageToDP(2) }} title={coursesdetail.name}>
                              {this.state.productdetails == undefined || this.state.productdetails[0].courses.length == 0 ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: heightPercentageToDP("15%") }}><ActivityIndicator size="large" color={NEW_GRAD2} /></View> :
                                (
                                  coursesdetail.subjects.map((chapter, index) => {
                                    // console.log("CHAPTERS")
                                    // console.log(chapter.chapters)
                                    return (
                                      <List.Accordion style={{ backgroundColor: "white", borderRadius: 8, borderBottomWidth: .6, borderBottomColor: "#DCDCDC" }} titleStyle={{ color: "black", fontFamily: 'Roboto-Regular', fontSize: heightPercentageToDP(1.7) }} title={chapter.name}>
                                        {
                                          this.state.loadingTrack ? <ActivityIndicator size={"large"} color={LIGHTGREY} />
                                            :
                                            <FlatList
                                              data={chapter.chapters}
                                              style={{ marginTop: 0 }}
                                              renderItem={({ item, index }) => {
                                                return (
                                                  <View>
                                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("VideoList", { item: item })} style={{ marginHorizontal: 10, borderBottomColor: "#ececec", borderBottomWidth: .5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: heightPercentageToDP(1), }} >
                                                      <Image source={require("../../assets/online-class.png")} style={{ height: heightPercentageToDP(3), width: heightPercentageToDP(3) }} />
                                                      <View>
                                                        <Text numberOfLines={2} style={{ color: 'black', fontSize: heightPercentageToDP(1.7), width: widthPercentageToDP(75), fontFamily: 'Roboto-Regular' }}>{item.name}</Text>
                                                        <View style={{ flexDirection: 'row', }}>
                                                          {/* <Text numberOfLines={1} style={{backgroundColor:"#dbefff",padding:5,color:NEWBLUE,borderRadius:4,textAlign:'center',marginTop:5,fontSize:10,}}>Petrolium Engineering</Text> */}
                                                        </View>
                                                      </View>
                                                      <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', }}>
                                                        <Ionicons name="ios-arrow-forward" size={16} color="grey" />
                                                      </View>
                                                    </TouchableOpacity>
                                                  </View>
                                                  // <View>
                                                  //   {this.state.productdetails[0].courses == 0 ? null :
                                                  //     <CourseSubject navigationHome="CourseBuys" navigation={this.props.navigation} horizontal={false} data={chapter.chapters} />
                                                  //   }
                                                  // </View>
                                                )
                                              }}
                                            />
                                        }
                                      </List.Accordion>
                                    )
                                  })
                                )
                              }
                            </List.Accordion>
                          )
                        })
                      )
                    }
                  </ScrollView>

                  :
                  <View>

                  </View>
              }
            </View>
          }

          {this.state.notifications == undefined ? null :
            <View style={{ flex: 1 }} >
              {
                this.state.tab == "2" ?
                  <ScrollView style={{ flex: 1, width: this.state.videoWidth, backgroundColor: 'transparent', }}>
                    {
                      this.state.notifications.length == 0 ?
                        <View style={{ justifyContent: 'center', alignContent: 'center', marginTop: 80 }}>
                          {/* <Image source={require("../../assets/evaluation.png")} style={{ justifyContent: 'center', alignContent: 'center', alignSelf: 'center', textAlign: 'center', height: heightPercentageToDP(8), width: heightPercentageToDP(8), marginTop: 15 }} /> */}
                          <LottieView
                            autoPlay
                            source={require("../utils/OTSLoaderTest.json")}
                            style={{ height: 140, width: 140, justifyContent: 'center', alignContent: 'center', alignSelf: 'center', }}
                          />
                          <Text style={{ textAlign: 'center', fontSize: heightPercentageToDP(2), color: 'black', marginTop: 10 }}>No Announcements</Text>
                        </View>
                        :
                        <FlatList
                          ListFooterComponent={this._renderFooter}
                          onEndReachedThreshold={.5}
                          data={this.state.notifications}
                          renderItem={this.renderAnnouncement}
                        />
                    }
                  </ScrollView>
                  :
                  <View>

                  </View>
              }
            </View>
          }


          {/* {this.state.liveclass == undefined ? null : */}
          <View style={{ flex: 1 }} >
            {
              this.state.tab == "4" ?
                <ScrollView style={{ flex: 1, width: this.state.videoWidth, backgroundColor: 'transparent', }}>
                  {
                    this.state.liveclass.length == 0 ?
                      <View style={{ justifyContent: 'center', alignContent: 'center', marginTop: 80 }}>
                        {/* <Image source={require("../../assets/evaluation.png")} style={{ justifyContent: 'center', alignContent: 'center', alignSelf: 'center', textAlign: 'center', height: heightPercentageToDP(8), width: heightPercentageToDP(8), marginTop: 15 }} /> */}
                        <LottieView
                          autoPlay
                          source={require("../utils/OTSLoaderTest.json")}
                          style={{ height: 140, width: 140, justifyContent: 'center', alignContent: 'center', alignSelf: 'center', }}
                        />
                        <Text style={{ textAlign: 'center', fontSize: heightPercentageToDP(2), color: 'black', marginTop: 10 }}>No Live Class Available</Text>
                      </View>
                      :
                      <FlatList
                        ListFooterComponent={this._renderFooter}
                        onEndReachedThreshold={.5}
                        data={this.state.liveclass}
                        renderItem={this.renderLiveClass}
                      />
                  }
                </ScrollView>
                :
                <View>

                </View>
            }
          </View>
          {/* } */}


        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  placeholder: {
    backgroundColor: '#65C888',
    flex: 1,
    height: 120,
    marginHorizontal: 20,
    marginTop: 20
  },
  name: {
    fontSize: 18,
    color: "#696969",
    fontFamily: 'Roboto-Bold',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20
  },
  descriptiontxv: {
    fontSize: 15,
    color: LIGHTGREY,
    fontFamily: 'Roboto-Bold',
    marginLeft: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    marginTop: 20
  },
  price: {
    marginTop: 10,
    fontSize: 18,
    color: "green",
    fontFamily: 'Roboto-Bold',
    alignSelf: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: 10,
    color: "#696969",
    justifyContent: 'center',
    margin: 5
  },
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
  childView: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10
  },
  StarImage: {
    width: 40,
    height: 40,
    resizeMode: 'cover'
  },
  textStyle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    marginTop: 15
  },
  textStyleBig: {
    textAlign: 'center',
    fontSize: 20,
    color: '#000',
    marginTop: 15
  },
  container1: {
    borderRadius: 6,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ececec',
    padding: 5,
  },
  row: {
    flex: 1,
    flexDirection: 'row'
  },
  title: {
    fontSize: 14,
    width: widthPercentageToDP(55),
    color: '#000',
    marginRight: 10,
    fontWeight: 'bold'
  },
  inner: {
    marginLeft: 5
  },
  caption: {
    fontSize: 10,
    color: 'grey',
    width: 200,
  },
  button: {
    backgroundColor: BLUE,
    width: widthPercentageToDP(60),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    padding: heightPercentageToDP(1),
    marginTop: 5
  },
  join: {
    color: "#fff",
    textAlign: "center",
    fontSize: heightPercentageToDP(2)
  },
  time: {
    color: 'grey',
    fontSize: 10
  },
  streaming: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, .9)',
    borderRadius: 4,
    width: widthPercentageToDP(30),
    alignSelf: 'center',
    padding: 6
  },
  streamingText: {
    color: "#fff",
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: 'bold'
  }

});