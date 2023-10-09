import React, { Component, Fragment } from 'react';
import { View, RefreshControl, Image, StyleSheet, Modal, ActivityIndicator, TextInput, PermissionsAndroid, AsyncStorage, TouchableOpacity, StatusBar, Platform, Alert, ImageBackground, BackHandler, DeviceEventEmitter, TouchableHighlight } from 'react-native';
import { styles, Header, BG_COLOR, WIDTH, HEIGHT, GREEN, LIGHT_GREY, GREY, BLUE, GRAD1, BORDER_RADIUS, GRAD2, BORDER_RADIUS_BUY_BUTTON, LIGHTGREY, ORANGE, LIGHT_GREEN, LIGHT_BLUE, ORANGE_NEW, NEW_GRAD1, NEW_GRAD2, BLUE_UP, LOGIN_BG, BLACK, WHITE, RedMunsell, ORANGES, BLUELIGHT } from '../utils/utils';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import Thumbnail from "../utils/Thumbnail"
import HeadingText from "../utils/HeadingText"
import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import List from '../utils/List';
import { fetchTestSeries, fetchVideos, fetchProductType, fetchAllProducts, fetchVideoSeries, fetchCourses, searching, BASE_URL, fetchSubjects, fetchWatchHistory, fetchUserDetails, fetchBanners, checkVideoThreshold, refreshToken, fetchLiveEvents, fetchExams, fetchHomePageProduct, fetchCartList, checkUserState } from '../utils/configs';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import Subject from "./Subject"
import VideoList from './VideoList';
import VideoPlayer from './VideoPlayer';
import BlankError from '../utils/BlankError';
import Videos from './Videos';
import PdfViewer from './PdfViewer';
import ViewInvoice from './ViewInvoice';
import Loader from '../utils/Loader';
import Blogs from './Blogs';
import Test from './LiveChat';
import OTS from './OTS';
import firebase from "react-native-firebase"
import PushNotification from "react-native-push-notification";
import QueryRoom from './QueryRoom';
import * as Animatable from 'react-native-animatable';
import Discussion from './Discussion';
import Carousel from 'react-native-snap-carousel';
import { LinearGradient } from "expo-linear-gradient"
import PieChart from 'react-native-pie-chart';
import ContentLoader, { Rect, Circle, } from 'react-content-loader/native'
import Background from '../utils/Background';
import Chapters from './AllChapters';
import AllChapters from './AllChapters';
import Notification from './Notification';
import AwesomeAlert from "react-native-awesome-alerts"
import ShimmerLoader from '../utils/ShimmerLoader';
import WatchList from './WatchList';
import Webinar from './Webinar';
import YoutubeLive from './YoutubeLive';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import DeivceInfo, { getDeviceId, getUniqueId, getSystemName, getDeviceName, getModel, getSerialNumberSync, getSerialNumber, getBrand } from "react-native-device-info";
import Orientation from 'react-native-orientation';
import Live from '../screens/Live/Live';
import EventList from './Live/EventList';
import LivePlayer from './LivePlayer';
import LiveChat from './LiveChat';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import Courses from './Courses';
import CourseDetails from './CourseDetails';
import ExamsDetails from './ExamsDetails';
import ExamDetailsProductWise from './ExamDetailsProductWise';
import CourseDetailProductWise from './CourseDetailProductWise';
import SubjectDetails from "./SubjectDetails"
import Lecture from './Lecture';
import HomeList from "./Youtube/HomeList"
import PlayList from './Youtube/Playlist';
import YoutubeVideoPlayer from './Youtube/YoutubeVideoPlayer';
import YoutubeHome from './Youtube/YoutubeHome';
import GeniqueFreeCourses from './GeniqueFreeCourses';
import AllCourses from './AllCourses';
import CourseBuys from './CourseBuys';
import CourseBuyFromCart from './CourseBuyFromCart';
import CartList from './CartList';
import OrderList from './OrderList';
import ProductList from './ProductList';
import OrderDetail from './OrderDetail';
import MyCourseDetail from './MyCourseDetail';
import Checkout from './Checkout';
import ProductListComponent from './components/ProductListComponent';
import ExamListComponent from './components/ExamListComponent';
import { Block, Text, Card } from 'expo-ui-kit';
import Video from 'react-native-video';
import Star from 'react-native-star-view';

const colors = ['#E52940', '#FF824E', '#FFC430', '#FF8D1D', '#FF8D1D', '#FFC430', '#609A01', '#88C300', '#9866E1', '#9487FA', '#37A19F', '#04D0A9'];

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      searchModal: false,
      deviceID: getUniqueId(),
      deviceBrand: getBrand(),
      deviceModal: getModel(),
      oneLineQuestions: [],
      subjects: [],
      videos: [],
      courses: [],
      category: ["PrevSub", "Paper", "Videos"],
      searchText: '',
      searchReuslts: {
        videos: [],
        courses: [],
        pyqPapers: [],
        subjects: []
      },
      scrolling: false,
      testGiven: null,
      totalTest: null,
      courseProgress: null,
      totalVideo: null,
      loading: false,
      token: '',
      offset: 0,
      loadingMore: false,
      isSearchOpen: false,
      subjectOffset: 0,
      loaded: false,
      recentPlay: [],
      watchHisotry: [],
      firstLogin: false,
      userDetails: '',
      showLoginAlert: false,
      banners: [],
      lockedMessage: false,
      videoThresold: 0,
      videoViews: 0,
      lockedMessage: false,
      liveEvents: [],
      exams: [],
      productTypes: []
    };
  }

  async componentDidMount() {
    changeNavigationBarColor(BG_COLOR)
    this.getValueLocally()
    this.youtubeAuth();
    this.props.navigation.addListener('willFocus', this._handleStateChange);
    //await changeNavigationBarColor(BLUE, false)
    Orientation.lockToPortrait()

    // DeviceInfo.isEmulator().then(e => {
    //   if (e == true && e == "") {
    //     Alert.alert("Your Device is not Compatible")
    //     BackHandler.exitApp()
    //   }
    // })


    AsyncStorage.getItem("user_token").then(token => {
      fetchCartList(token).then(data => {
        // console.log("CART LIST")
        // console.log(data)
        if (data.success) {
          this.setState({
            cartlist: data.carts,
            cartprice: data,
            loading: false
          })
        }
      })
    })


    try {
      const permission = await firebase.messaging().requestPermission();
      if (permission) {
        // alert("You Will Recieve Push Notification ")
      }

    } catch (error) {
      // Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
    }

    AsyncStorage.getItem("user_id").then(id => {
      AsyncStorage.getItem("user_token").then((token) => {
        firebase.messaging().getToken().then(data => {
          console.log("TOKEN DATA " + data)
          //console.log("DEVICE ID FOR MOBILE " + this.state.deviceID)
          if (data) {
            fetch(`${BASE_URL}/api/v1/users/update`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-AUTH_TOKEN': token
              },
              body: JSON.stringify({
                fcm_token: data,
                id: parseInt(id),
                device_model: this.state.deviceModal,
                device_brand: this.state.deviceBrand
              }),
            })
              .then((res) => res.json())
              .then((res) => {
                // console.log("USER UPDATE SUCCESS DATA")
                // console.log(res); 
                if (res.success) {
                  console.log("SUCCESS USER UPDATE")
                  return;
                } else {
                  console.log(res.error)
                }
              }).catch((err) => console.log(err))

          } else {
            alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
          }
        });
      })
    })

    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {

    }
  }

  youtubeAuth = async () => {
    await fetch(`${BASE_URL}/api/v1/settings/youtubeAuth`, {
      method: "GET",
      headers: {
        'X-AUTH-TOKEN': await AsyncStorage.getItem('user_token')
      }
    })
      .then(response => response.json())
      .then((response) => {
        if (response.success) {
          this.setState({
            youtubeApiKey: response.value.youtubeApiKey,
            channelID: response.value.channelID
          })
          console.log(response.value.youtubeApiKey + response.value.channelID)
          AsyncStorage.setItem("youtube_api_key", response.value.youtubeApiKey)
          AsyncStorage.setItem("youtube_channelid", response.value.channelID)
        } else {
          Alert.alert("youtube key not found")
        }

      })
      .catch(err => {
        //console.error(err);
        Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
      });
  }

  _handleStateChange = state => {
    //alert('Refreshed successfully!')
    this.getValueLocally()
  };

  async getValueLocally() {
    AsyncStorage.getItem('item_count').then((value) => this.setState({ itemcount: value }))
  }

  componentWillMount() {
    const id = DeivceInfo.getUniqueId()
    const model = DeivceInfo.getModel()
    const brand = DeivceInfo.getBrand()
    this.setState({
      deviceID: id,
      deviceBrand: brand,
      deviceModal: model

    })
    console.log("DEVICE ID " + this.state.deviceID)
    console.log(model)
    console.log(brand)

    this.setState({
      subjectOffset: 0
    })

    this.getValueLocally();
    AsyncStorage.getItem('item_count').then((value) => this.setState({ itemcount: value }))
    AsyncStorage.getItem("user_token").then(token => {
      this.setState({
        token: token
      })
      this.getValueLocally();

      fetchExams(token, this.state.offset).then(res => {
        //console.log(res)
        if (res.success) {
          this.setState({
            exams: res.exams
          })
        }
      })

      AsyncStorage.getItem("user_token").then(token => {
        this.setState({
          token: token
        })

        fetchHomePageProduct(token)
          .then(res => {
            if (res.success) {
              this.setState({
                loading: false,
                banners: res.banners,
                productcoursewise: res.courses,
                productexamwise: res.exams,
                otstokenurl: res.OtsAccessUrl,
                loadingMore: false
              })
            }
          })

        fetchAllProducts(token, this.state.offset,)
          .then(res => {
            console.log("PRODUCT LIST")
            if (res.success) {
              console.log(res)
              this.setState({
                loading: false,
                products: res.products,
                loadingMore: false
              })
            }
          })
      })

      refreshToken(this.state.token).then(data => {
        if (data.success) {
          this.setState({
            token: data.token
          })
          AsyncStorage.setItem("user_token", data.token)
          AsyncStorage.setItem("ots_token", data.OtsAccessToken)
        } else {
          Alert.alert("Something went wrong")
        }
      })


      AsyncStorage.getItem("user_name").then((name) => {
        this.setState({
          userDetails: name
        })
      })

      AsyncStorage.getItem("user_id").then(id => {
        fetchUserDetails(id, token).then((res) => {
          if (res.success) {
            this.setState({
              userDetails: res.user,
            })
          } else {
            Alert.alert(res.error)
          }
        })
      })

      AsyncStorage.getItem("firstLogin").then(val => {
        if (val == "true") {
          this.setState({ showLoginAlert: false })
        } else {
          AsyncStorage.setItem("firstLogin", "true", () => {
            this.setState({ showLoginAlert: true })
          })
        }
      });

      // fetchVideos(token).then(data => {
      //   this.setState({
      //     videos: data.videos
      //   })
      // });

      fetchProductType(token).then(data => {
        // console.log("PRODUCT TYPE")
        // console.log(data)
        this.setState({
          productTypes: data.productTypes
        })
      });

      fetchCourses(token, 0).then(res => {
        this.setState({
          courses: res.courses
        })
      })

      fetchWatchHistory(token).then(data => {
        if (data.success) {
          let watchList = []
          for (var vid in data.videos) {
            watchList.push(data.videos[vid])
          }
          this.setState({
            watchHisotry: watchList
          })
        }
        else {
          Alert.alert("Someting went wrong")
        }
      })

      fetchSubjects(token, this.state.subjectOffset).then(data => {
        this.setState({
          subjects: data.subjects,
          loaded: true
        })
      })
    })
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
    fetchAllProducts(this.state.token, this.state.offset,).then(data => {
      if (data.products.length != 0) {
        this.setState({
          products: [...this.state.products, ...data.products],
          loadingMore: false
        })
      } else {
        this.setState({
          loadingMore: false
        });
      }
    });
  }

  handleSearch = () => {
    if (this.state.searchText.length !== 0) {
      this.setState({
        searchModal: true
      })
      AsyncStorage.getItem("user_token").then(token => {
        searching(this.state.searchText, token).then(data => {
          this.setState({
            searchReuslts: data
          })
        })
      })
    }
    else {
      Alert.alert("Type in search box")
    }
  }

  renderTopList = ({ item, index }) => {
    return item.locked ? (
      <View style={{ height: 100, width: 100, borderRadius: 10, margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
        <TouchableOpacity onPress={() => {
          this.setState({ searchModal: false, packageLocked: true })
        }} style={{ flex: 1, height: 80, width: 80, borderRadius: 10, paddingTop: 0, }}>
          <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: 100, height: 100, }} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: 100, width: 120 }} >
            <Text style={{ color: 'white', fontSize: 8, margin: 10, width: 100, position: 'absolute', bottom: 2 }}>
              {item.name}
            </Text>
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
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: 100, width: 120 }} >
            <Text style={{ color: 'white', fontSize: 10, margin: 10, width: 100, position: 'absolute', bottom: 4 }}>
              {item.name}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    )
  }

  renderRecentPlayList = ({ item, index }) => {
    return item.locked ? (
      <TouchableOpacity onPress={() => this.setState({ lockedMessage: true })} style={{ height: 80, width: 120, borderRadius: BORDER_RADIUS, margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
        <View style={{ flex: 1, height: 80, width: 80, borderRadius: 10, paddingTop: 0, }}>
          <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: 120, height: 80, }} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: 100, width: 150 }} >
            <Text numberOfLines={1} style={{ color: 'white', fontSize: 10, margin: 5, width: 150, position: 'absolute', bottom: 4 }}>
              {item.title}
            </Text>
          </LinearGradient>
        </View>
        {/* <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="md-lock" size={40} color="white" /> */}
        {/* <Image source={require("../../assets/play-button-min.png")} style={{width:40,height:40,resizeMode:'contain'}} /> */}
        {/* </View> */}
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("VideoPlayer", { item: item })} style={{ height: 80, width: 120, borderRadius: 10, margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
        <View style={{ flex: 1, height: 80, width: 80, borderRadius: BORDER_RADIUS, paddingTop: 0, }}>
          <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: 120, height: 80, }} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: 100, width: 150 }} >
            <Text numberOfLines={1} style={{ color: 'white', fontSize: 10, margin: 5, width: 150, position: 'absolute', top: 55, bottom: 4 }}>
              {item.title}
            </Text>
          </LinearGradient>
        </View>
        <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
          {/* <Ionicons name="ios-play-circle" size={34} color={BLUE} /> */}
          <Image source={require("../../assets/play-button-min.png")} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
        </View>
      </TouchableOpacity>
    )
  }


  renderList = ({ item, index }) => {
    return (
      <Thumbnail leftIcon="file-pdf-o" data={item} small={false} onPress={() => { this.setState({ searchModal: false }); this.props.navigation.navigate("VideoPlayer", { item: item }) }} />
    )
  }

  renderBannerList = ({ item, index }) => {
    //console.log(item)
    return (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("AllCourses")}>
        <Image source={{ uri: `${BASE_URL}${item.image}` }} style={{ width: WIDTH - 30, height: 160, borderRadius: 10, margin: 10 }} />
      </TouchableOpacity>
    )
  }

  renderSearchList = ({ item, index }) => {
    return (
      <List listType="videoList" data={item} onPress={() => this.onPressListItem(item)} rightIcon="ios-arrow-forward" />
    )
  }

  renderWatchList = ({ item, index }) => {
    return (
      <View style={{ height: 100, width: 100, borderRadius: 10, margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
        <TouchableOpacity onPress={() => this.props.navigation.navigate("VideoPlayer", { item: item })} style={{ flex: 1, height: 80, width: 80, borderRadius: 10, paddingTop: 0, }}>
          <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: 100, height: 100, }} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: 100, width: 120 }} >
            <Text style={{ color: 'white', fontSize: 10, margin: 10, width: 100, position: 'absolute', bottom: 4 }}>
              {item.name}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    )
  }

  renderPyp = ({ item, index }) => {
    return (
      <List data={item} rightIcon="ios-arrow-forward" listType="videoList" onPress={() => { this.setState({ searchModal: false }); this.props.navigation.navigate("PdfViewer", { item: item }) }} />
    )
  }

  onPressListItem = (item) => {
    this.setState({
      searchModal: false
    }, () => {
      this.props.navigation.navigate("Subject", { item: item })
    })
  }


  componentWillUnmount() {
    this.props.navigation.navigate("Splash");
  }


  onRefresh = () => {
    this.componentWillMount()
    refreshToken(this.state.token).then(data => {
      if (data.success) {
        this.setState({
          token: data.token
        })
        AsyncStorage.setItem("user_token", data.token)
        AsyncStorage.setItem("ots_token", data.OtsAccessToken)
      } else {
        Alert.alert("Something went wrong")
      }
    })
  }

  searchOpen = () => {
    this.setState({
      isSearchOpen: !this.state.isSearchOpen
    })
  }

  renderCategoryList = ({ item, index }) => {
    return (
      <Thumbnail data={item} onPress={() => this.props.navigation.navigate(item.title, { subjects: this.state.subjects })} />
    )
  }

  _renderFooter = () => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', height: heightPercentageToDP(8) }}>
        {this.state.loadingMore ? <ActivityIndicator size="large" /> : null}
      </View>
    )
  }

  renderData = ({ item, index }) => {
    return (
      <View style={styles.card1}>
        <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseBuys", { item: item })}>
          <View style={styles.imageContainer1}>
            <Image style={styles.cardImage1} source={{ uri: `${BASE_URL}${item.cover_image}` }} />
            <LinearGradient colors={["transparent", "transparent"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
              {item.product_type == undefined ? null :
                <Text numberOfLines={1} style={{ fontWeight: 'normal', fontSize: heightPercentageToDP(1.3), backgroundColor: BG_COLOR, width: heightPercentageToDP(12), color: 'white', bottom: heightPercentageToDP(-15), right: 0, padding: 5 }}>{item.product_type.title}</Text>
              }
            </LinearGradient>
          </View>
        </TouchableOpacity>
        <View style={styles.cardContent1}>
          <Text numberOfLines={1} style={styles.title1}>{item.name}</Text>
          <Star score={item.average_review} style={styles.starStyle1} />
          <View style={{ flexDirection: 'row' }}>
            {item.finalAmount == 0 ? <Text style={styles.count1}>Free</Text>
              :
              <Text style={styles.count1}>{'\u20B9'}{item.finalAmount}</Text>
            }
            {item.finalAmount == item.amount ? null :
              <Text style={styles.count2}>{'\u20B9'}{item.amount}</Text>
            }
          </View>
          <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseBuys", { item: item })}>
            <Block center marginLeft={heightPercentageToDP(1.1)}>
              <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: 1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ padding: 10, width: widthPercentageToDP(40), borderRadius: BORDER_RADIUS_BUY_BUTTON, marginTop: heightPercentageToDP(1), alignSelf: 'center' }}>
                <Text style={{ fontSize: heightPercentageToDP(1.3), fontWeight: 'bold', textAlign: 'center', color: 'white', borderRadius: 4, justifyContent: 'center' }}>Buy Now</Text>
              </LinearGradient>
            </Block>

          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => addTo(item.id, 1)}>
          <Text style={{textAlign:'right', color:BLUE, fontSize:heightPercentageToDP(2), fontWeight:'bold'}}>BUY</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    )
  }

  renderSearchVideoList = ({ item, index }) => {
    const getMinutesFromSeconds = (time) => {
      const minutes = time >= 60 ? Math.floor(time / 60) : 0;
      const seconds = Math.floor(time - minutes * 60);

      return `${minutes >= 10 ? minutes : '0' + minutes}:${seconds >= 10 ? seconds : '0' + seconds
        }`;
    }

    return (
      item.locked ? (
        <TouchableOpacity onPress={() => this.setState({ lockedMessage: true })} style={{ flexDirection: 'row', justifyContent: 'space-between', width: hp("50%"), marginTop: 10, borderBottomColor: "#ececec", borderBottomWidth: .5 }}>
          <View style={{ height: hp("10%"), width: hp("20%"), borderRadius: heightPercentageToDP(.7), margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
            <View style={{ flex: 1, height: hp("10"), width: hp("20%"), borderRadius: heightPercentageToDP(.7) }}>
              <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ height: hp("10"), width: hp("20%") }} />
              {/* <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: hp("10"), width: hp("20%") }} >
  //             </LinearGradient> */}
            </View>
            <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require("../../assets/play-button-min.png")} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
            </View>
          </View>
          <View style={{ margin: 5, padding: 10, width: wp("60%"), justifyContent: 'space-between' }}>
            <Text style={{ color: "black", fontSize: hp("1.8%"), width: WIDTH / 2, fontFamily: 'Roboto-Bold' }} numberOfLines={2}>{item.title}</Text>
            <Text style={{ color: "black", width: WIDTH / 2, fontSize: hp("1.5%"), marginTop: 10 }} numberOfLines={1}><AntDesign name="clockcircleo" size={hp("1.5%")} color={"black"} />  {getMinutesFromSeconds(item.duration)}</Text>
          </View>
        </TouchableOpacity>
      ) :
        <TouchableOpacity onPress={() => {
          this.setState({ searchModal: false })
          this.props.navigation.navigate("VideoPlayer", { item: item })
        }} style={{ flexDirection: 'row', justifyContent: 'space-between', width: hp("50%"), marginTop: 10, borderBottomColor: "#ececec", borderBottomWidth: .5 }}>
          <View style={{ height: hp("10%"), width: hp("20%"), borderRadius: heightPercentageToDP(.7), margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
            <View style={{ flex: 1, height: hp("10"), width: hp("20%"), borderRadius: heightPercentageToDP(.7) }}>
              <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ height: hp("10"), width: hp("20%") }} />
              {/* <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: hp("10"), width: hp("20%") }} >
  //             </LinearGradient> */}
            </View>
            <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require("../../assets/play-button-min.png")} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
            </View>
          </View>
          <View style={{ margin: 5, padding: 10, width: wp("60%"), justifyContent: 'space-between' }}>
            <Text style={{ color: "black", fontSize: hp("1.8%"), width: WIDTH / 2, fontFamily: 'Roboto-Bold' }} numberOfLines={2}>{item.title}</Text>
            <Text style={{ color: "black", width: WIDTH / 2, fontSize: hp("1.5%"), marginTop: 10 }} numberOfLines={1}><AntDesign name="clockcircleo" size={hp("1.5%")} color={"black"} />  {getMinutesFromSeconds(item.duration)}</Text>
          </View>
        </TouchableOpacity>
    )
  }


  render() {
    const renderExams = ({ item, index }) => {
      return (
        <TouchableOpacity onPress={() => this.props.navigation.navigate("ExamDetailsProductWise", { item: item })} style={{ height: 100, width: 100, borderRadius: BORDER_RADIUS, overflow: 'hidden', paddingTop: 0, marginLeft: hp(2), borderWidth: 1, borderColor: '#f2f2f2' }}>
          <View style={{ flex: 1, height: 80, width: 80, borderRadius: BORDER_RADIUS, paddingTop: 0, }}>
            <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: 100, height: 100, }} />
            <LinearGradient colors={['transparent', 'transparent',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: 100, width: 120 }} >
              {/* <Text style={{ color: 'black', fontSize: 10, margin: 10, width: 80, position: 'absolute', bottom: 4 ,marginTop: 20}} numberOfLines={2} >
                {item.name}
              </Text> */}
            </LinearGradient>
          </View>
          {item.locked ? <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }} ><Ionicons name="ios-lock" size={30} color={"white"} /></View> : null}
        </TouchableOpacity>
      )
    }

    const renderLiveEvents = ({ item, index }) => {
      return (
        <TouchableOpacity onPress={() => {
          item.locked ? this.setState({ lockedMessage: true }) : this.props.navigation.navigate("LivePlayer", { item })
        }} style={{ height: 100, width: 100, borderRadius: 4, margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
          <View style={{ flex: 1, height: 80, width: 80, borderRadius: 10, paddingTop: 0, }}>
            <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: 100, height: 100, }} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: 100, width: 120 }} >
              <Text style={{ color: 'white', fontSize: 10, margin: 10, width: 80, position: 'absolute', bottom: 4 }} numberOfLines={2} >
                {item.title}
              </Text>
              <Text style={{ color: 'white', backgroundColor: 'red', padding: 3, fontSize: 10, margin: 10, width: 30, position: 'absolute', top: 2, textAlign: 'center', borderRadius: 3, right: heightPercentageToDP(3) }}  >
                LIVE
              </Text>
            </LinearGradient>
          </View>
          {item.locked ? <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }} ><Ionicons name="ios-lock" size={30} color={"white"} /></View> : null}
        </TouchableOpacity>
      )
    }

    // const renderProductType = ({ item, index }) => {
    //   return (
    //     <View style={{ marginLeft: heightPercentageToDP(1.8) }}>
    //       <TouchableOpacity onPress={() => { this.props.navigation.navigate("ProductList", { item: item }) }} style={{ backgroundColor: '#03A2E829', paddingVertical: heightPercentageToDP(1), paddingHorizontal: heightPercentageToDP(1), borderWidth: 1, borderColor: "#07A1E8", borderRadius: 50 }} >
    //         <Text style={{ fontFamily: 'Roboto-Regular', color: '#07A1E8' }}>{item.title}</Text>
    //       </TouchableOpacity>
    //     </View>
    //   )
    // }
    const renderProductType = ({ item, index }) => {
      return (
        <View style={{ marginLeft: heightPercentageToDP(1.5) }}>
          <TouchableOpacity onPress={() => { this.props.navigation.navigate("ProductList", { item: item }) }} style={{ backgroundColor: '#03A2E829', paddingVertical: heightPercentageToDP(.5), paddingHorizontal: heightPercentageToDP(1), borderWidth: 1, borderColor: "#07A1E8", borderRadius: heightPercentageToDP(2), marginHorizontal: .5, }} >
            <Text style={{ fontFamily: 'Roboto-Regular', color: '#07A1E8', fontSize: 14 }}>{item.title}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return !this.state.loaded ? <ShimmerLoader /> : (
      <Fragment>
        <ScrollView style={{ paddingBottom: 0, backgroundColor: WHITE }} refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />} showsVerticalScrollIndicator={false} onScrollBeginDrag={() => this.setState({ scrolling: !this.state.scrolling })} onScrollEndDrag={() => this.setState({ scrolling: !this.state.scrolling })}>
          {/* <View style={{ height: heightPercentageToDP(26), backgroundColor: LOGIN_BG, borderBottomLeftRadius: 50 }}></View> */}
          <View style={{ width: WIDTH }}>
            <StatusBar backgroundColor={BG_COLOR} barStyle="light-content" />
            <Video source={require("../../assets/login-bg.mp4")}
              style={{
                width: WIDTH, height: heightPercentageToDP("35%"),
                opacity: 1,
                backgroundColor: BG_COLOR,
              }}
              repeat
              resizeMode="cover"
            />

            <View style={{ position: 'absolute', top: heightPercentageToDP(1.3), left: 0, right: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', marginTop: heightPercentageToDP(-1) }}>
                <TouchableOpacity onPress={() => this.props.navigation.toggleDrawer()}>
                  <Image source={require("../../assets/menu-final.png")} style={{ height: 37, width: 30, marginLeft: heightPercentageToDP(2) }} />
                </TouchableOpacity>

                <Image source={require("../../assets/Logo-light.png")} style={{ width: 180, resizeMode: 'contain', height: 40, paddingLeft: 60, marginLeft: 5 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate("Notification")}>
                    <LinearGradient colors={[BLUE, BLUE]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ height: 30, width: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2, marginRight: 10 }} >
                      <TouchableOpacity onPress={() => this.props.navigation.navigate("Notification")}>
                        <View>
                          <AntDesign onPress={() => this.props.navigation.navigate("Notification")} name="bells" size={16} color="white" style={{}} />
                        </View>
                      </TouchableOpacity>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate("WatchList")}>
                    <LinearGradient colors={[BLUE, BLUE]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ height: 30, width: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2, marginRight: 10 }} >
                      <TouchableOpacity onPress={() => this.props.navigation.navigate("WatchList")}>
                        <View>
                          <Ionicons onPress={() => this.props.navigation.navigate("WatchList")} name="ios-bookmark" size={16} color="white" style={{}} />
                        </View>
                      </TouchableOpacity>
                    </LinearGradient>
                  </TouchableOpacity>
                  {/* <Ionicons onPress={() => this.props.navigation.navigate("WatchList")} name="ios-bookmark" size={24} color="white" style={{ marginRight: 10, }} /> */}
                </View>

                {/* <Animatable.View duration={200} animation={this.state.isSearchOpen ? "slideInRight" : null} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 27, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, width: this.state.isSearchOpen ? WIDTH : 100, height: 40, overflow: 'hidden' }}>
                    {
                      this.state.isSearchOpen
                        ?
                        <TextInput
                          placeholder="Search"
                          style={{ width: WIDTH - 90, height: 40, backgroundColor: 'white', textAlign: 'center', borderRadius: 5 }}
                          onSubmitEditing={this.handleSearch}
                          onBlur={() => this.setState({ isSearchOpen: false })}
                          autoFocus
                          onChangeText={(text) => this.setState({ searchText: text })}
                        />
                        :
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                          <TouchableOpacity onPress={() => this.setState({ isSearchOpen: true })} style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="ios-search" color={"white"} size={25} />
                          </TouchableOpacity>
                        </View>
                    }
                  </Animatable.View> */}
              </View>

              <Block center marginTop={HEIGHT > 914 ? heightPercentageToDP(2.5) : heightPercentageToDP(1)}>
                <Text style={mystyles.welcomeText}>
                  Grow Your Own Skill{'\n'} by Online Learning
                </Text>
              </Block>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                height: 50,
                top: 10,
                borderRadius: 8,
                width: widthPercentageToDP(80),
                alignSelf: 'center'
              }}>
                <TextInput
                  style={{ fontFamily: 'Roboto-Regular', justifyContent: 'center', width: widthPercentageToDP(70), height: hp("10%"), fontSize: 16, marginLeft: heightPercentageToDP(1.5) }}
                  placeholder="Search Courses, Videos"
                  onSubmitEditing={this.handleSearch}
                  onBlur={() => this.setState({ isSearchOpen: false })}
                  onChangeText={(text) => this.setState({ searchText: text })}
                />
                {/* <AntDesign name="user" size={20} color="grey" style={{ marginLeft: 15 }} /> */}
                {/* <TouchableHighlight onPress={this.handleSearch}>
                  <Image
                    source={require("../../assets/search-blue.png")}
                    style={{ width: 40, height: 40, marginLeft: heightPercentageToDP(-3.2) }}
                    onPress={() =>{this.handleSearch}}
                  />
                </TouchableHighlight> */}
                <TouchableOpacity onPress={() => { this.handleSearch }}>
                  <LinearGradient colors={[BLUE, BLUE]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ height: 35, width: 35, borderRadius: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2, right: 20 }} >
                    <TouchableOpacity onPress={() => { this.handleSearch }}>
                      <View>
                        <Ionicons onPress={() => { this.handleSearch }} name="ios-search" size={20} color="white" style={{}} />
                      </View>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              {/* 

                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    height: 55,
                    borderRadius: 12,
                    width: widthPercentageToDP(80)

                  }}>
               
                    <Image
                      source={require("../../assets/searchblue.png")}
                      style={{ width: 40, height: 40,  marginLeft: 5}}
                    />
                    <TextInput
                      style={{ fontFamily: 'Roboto-Regular', justifyContent: 'center', width: WIDTH - 80, fontSize: 14, marginLeft: heightPercentageToDP(0.5) }}
                      placeholder="Search"
                      onSubmitEditing={this.handleSearch}
                      onBlur={() => this.setState({ isSearchOpen: false })}
                      autoFocus
                      onChangeText={(text) => this.setState({ searchText: text })}
                    />
                  

                  </View> */}
            </View>
            <Modal visible={this.state.searchModal} onDismiss={() => this.setState({ searchModal: false })} onRequestClose={() => this.setState({ searchModal: false })} style={{ flex: 1, }} animated animationType="slide" presentationStyle="fullScreen" >
              <View style={{ backgroundColor: "white", flex: 1, }} >
                <View style={{ backgroundColor: "white", flexDirection: 'row', justifyContent: 'space-around', height: 60, width: WIDTH, alignItems: 'center', padding: 10, marginTop: Platform.OS == 'ios' ? 20 : 0, }}>
                  <Ionicons onPress={() => this.setState({ searchModal: false })} name="ios-arrow-back" size={25} color="grey" style={{ width: 50, marginLeft: 10 }} />
                  <TextInput
                    style={{ backgroundColor: "white", color: 'grey', width: WIDTH - 80 }}
                    value={this.state.searchText}
                    onChangeText={(searchText) => this.setState({ searchText })}
                    placeholder="Search Courses,Videos,Question papers"
                    placeholderTextColor={LIGHT_GREY}
                    autoFocus
                    keyboardAppearance="dark"
                    onSubmitEditing={this.handleSearch}
                  />
                </View>
                <ScrollView style={{ width: WIDTH }}>
                  {this.state.searchReuslts.videos.length !== 0 ? <View>
                    <HeadingText text={"Videos"} />
                    <FlatList
                      data={this.state.searchReuslts.videos}
                      renderItem={this.renderSearchVideoList}
                      style={{ margin: 5 }}
                    />
                  </View> :
                    <View>
                      <Text style={{ marginLeft: 5, marginTop: 10 }}> No Videos Available</Text>
                      <View style={{ width: '100%', marginTop: 10, borderBottomColor: "#DCDCDC", borderBottomWidth: .3 }}></View>
                    </View>
                  }

                  {this.state.searchReuslts.courses.length !== 0 ?
                    <View>
                      <HeadingText text={"Subjects"} />
                      <FlatList
                        horizontal
                        data={this.state.searchReuslts.courses}
                        renderItem={this.renderTopList}
                        style={{ margin: 5 }}
                        showsHorizontalScrollIndicator={false}
                      />
                    </View> :
                    <View>
                      <Text style={{ marginLeft: 5, marginTop: 10 }}> No Subjects Available</Text>
                      <View style={{ width: '100%', marginTop: 10, borderBottomColor: "#DCDCDC", borderBottomWidth: .3 }}></View>
                    </View>
                  }
                  {this.state.searchReuslts.pyqPapers.length !== 0
                    ?
                    <View>
                      <HeadingText text={"Previous Year Papers"} />
                      <FlatList
                        data={this.state.searchReuslts.pyqPapers}
                        renderItem={this.renderPyp}
                        style={{ margin: 5 }}
                      />
                    </View>
                    :
                    <View>
                      <Text style={{ marginLeft: 5, marginTop: 10 }}> No Previous Year Papers Available</Text>
                      <View style={{ width: '100%', marginTop: 10, borderBottomColor: "#DCDCDC", borderBottomWidth: .3 }}></View>
                    </View>
                  }
                </ScrollView>
              </View>
            </Modal>

            <AwesomeAlert
              show={this.state.showLoginAlert}
              showProgress={false}
              title={`Hi ${this.state.userDetails.first_name}!`}
              message={`Thanks for choosing ACME Academy for your Mathematics and Engineering course preparations.`}
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={true}
              showCancelButton={false}
              showConfirmButton={true}
              confirmText="OK"
              confirmButtonColor={BLUE}
              onCancelPressed={() => {
                this.setState({
                  showLoginAlert: false
                })
              }}
              onConfirmPressed={() => {
                this.setState({
                  showLoginAlert: false
                });
              }}
            />

            <AwesomeAlert
              show={this.state.lockedMessage}
              showProgress={false}
              title={`Subject Locked!`}
              message={`You have not subscribed to this subject. Please upgrade course plan to activate this subject  `}
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={true}
              showCancelButton={false}
              showConfirmButton={true}
              confirmText="OK"
              confirmButtonColor={BLUE}
              onConfirmPressed={() => {
                this.setState({
                  lockedMessage: false
                });
              }}
            />
            <AwesomeAlert
              show={this.state.packageLocked}
              showProgress={false}
              title={`Subject Locked!`}
              message={`You have not subscribed to this subject. Please upgrade course plan to activate this subject  `}
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={true}
              showCancelButton={false}
              showConfirmButton={true}
              confirmText="OK"
              confirmButtonColor={BLUE}
              onConfirmPressed={() => {
                this.setState({
                  packageLocked: false
                });
              }}
            />
          </View>

          <Block row padding={heightPercentageToDP(1)} space="evenly" marginTop={heightPercentageToDP(-8)}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("Webinar")} style={{ backgroundColor: '#E8F1FC', ...mystyles.card }}>
              <Image
                source={require('../../assets/bc.png')}
                style={{ width: 40, height: 40, alignSelf: 'center' }}
              />
              <Text numberOfLines={2} wrap size={8} marginTop={1} center>Webinar & {"\n"} Demo class </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("OTS")} style={{ backgroundColor: "#FEF4EB", ...mystyles.card }}>
              <Image
                source={require('../../assets/writing.png')}
                style={{ width: 40, height: 40, alignSelf: 'center' }}
              />
              <Text numberOfLines={2} wrap size={8} marginTop={1} center> Online {"\n"} Test</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("YoutubeHome")} style={{ backgroundColor: "#E5F9FB", ...mystyles.card }}>
              <Image
                source={require('../../assets/online-video.png')}
                style={{ width: 40, height: 40, alignSelf: 'center' }}
              />
              <Text numberOfLines={2} nowrap size={8} marginTop={1} center> Free {"\n"} Videos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("Blog")} style={{ backgroundColor: "#F0ECFD", ...mystyles.card }}>
              <Image
                source={require('../../assets/blogging1.png')}
                style={{ width: 40, height: 40, alignSelf: 'center' }}
              />
              <Text numberOfLines={1} wrap size={8} marginTop={1} center>Blogs</Text>
            </TouchableOpacity>


          </Block>

          <View style={{ flex: 1, backgroundColor: "white", width: widthPercentageToDP(100), paddingBottom: heightPercentageToDP(0.9), alignItems: 'center' }}>
            {/* 
            <TouchableOpacity onPress={() => this.props.navigation.navigate("AllSubjects", { item: this.state.subjects })}>

              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: heightPercentageToDP(1.3), color: BLUE, margin: 10, marginLeft: 10, textDecorationLine: 'underline', marginTop: 12 }}>See All</Text>
                <AntDesign name="arrowright" size={12} color={BLUE} style={{ marginTop: 12, marginRight: 10 }} />
              </View>

            </TouchableOpacity> */}

            <View style={{ width: WIDTH }} >
              <View style={{ marginRight: heightPercentageToDP(2), marginTop: heightPercentageToDP(1) }}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={this.state.productTypes}
                  keyExtractor={(item, index) => index}
                  renderItem={renderProductType}
                />
              </View>
            </View>


            {/* <ScrollView style={{ paddingBottom: 0 }} refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />} showsVerticalScrollIndicator={false} onScrollBeginDrag={() => this.setState({ scrolling: !this.state.scrolling })} onScrollEndDrag={() => this.setState({ scrolling: !this.state.scrolling })}> */}
            <Animatable.View animation={"slideInDown"}>
              <View style={{ marginTop: 10, height: 170, position: 'relative', marginLeft: heightPercentageToDP(0.5), width: widthPercentageToDP(100) }}>
                <Carousel
                  ref={(c) => { this._carousel = c; }}
                  data={this.state.banners}
                  renderItem={this.renderBannerList}
                  sliderWidth={WIDTH}
                  itemWidth={WIDTH}
                  autoplay
                  loop
                  centerContent
                />
              </View>
            </Animatable.View>
            {/* </ScrollView> */}


            {/* Exams */}

            {this.state.exams.length == 0 ? null :
              <View style={{ width: WIDTH }} >
                <HeadingText text="EXAMS" />
                <View style={{ marginRight: heightPercentageToDP(2) }}>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={this.state.productexamwise}
                    renderItem={renderExams}
                  />
                </View>
              </View>}

            {this.state.watchHisotry.length == 0 ? null : <View style={{ width: WIDTH }} >
              <HeadingText text="RECENTLY PLAYED" />
              <View style={{ marginLeft: heightPercentageToDP(1.1), marginRight: heightPercentageToDP(2) }}>
                <FlatList
                  horizontal
                  data={this.state.watchHisotry.slice(0, 4)}
                  renderItem={this.renderRecentPlayList}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>}

            {/* Course Type */}
            {/* {this.state.products == undefined || this.state.products.length == 0 ? <BlankError text="Nothing found" /> 
                    : 
                    <View style={{ width: WIDTH }} >
                    <HeadingText text="COURSES" />
                    <FlatList
                    ListFooterComponent={this._renderFooter}   
                    onEndReachedThreshold={.5}
                    numColumns={2}
                    onEndReached={this.loadMore} 
                    data={this.state.products}
                    style={{marginTop:2,marginLeft: heightPercentageToDP(1)}}
                    renderItem={this.renderData}
                />
                </View>} */}


            {
              this.state.courses.length == 0 ? null :
                <View style={{ width: WIDTH }} >
                  <FlatList
                    data={this.state.productexamwise}
                    renderItem={({ item, index }) => {
                      AsyncStorage.setItem('course_name', item.name)
                      return (
                        <View>
                          {item.products.length == 0 ? null :
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <TouchableOpacity>
                                <Text style={{ fontSize: heightPercentageToDP(1.5), color: BLACK, margin: 10, width: widthPercentageToDP(40), fontWeight: 'bold', fontFamily: 'Roboto-Regular', marginLeft: heightPercentageToDP(2) }} numberOfLines={2}>{item.name}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => this.props.navigation.navigate("ExamDetailsProductWise", { item: item })}>
                                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                  <Text style={{ fontSize: heightPercentageToDP(1.3), color: BLUE, margin: 10, marginLeft: 10, textDecorationLine: 'underline', }}>See All</Text>
                                  <AntDesign name="arrowright" size={12} color={BLUE} style={{ marginTop: 10, marginRight: 10 }} />
                                </View>
                              </TouchableOpacity>
                            </View>
                          }
                          {item.products.length == 0 ? null :
                            <ExamListComponent navigationHome="CourseBuys" navigation={this.props.navigation} horizontal={true} data={item.products} />
                          }
                        </View>
                      )
                    }}
                  />
                </View>
            }
          </View>
        </ScrollView>

        {/* chat */}
        <LinearGradient colors={[LIGHT_GREEN, LIGHT_GREEN]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', bottom: 20, right: 20, height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2 }} >
          <TouchableOpacity onPress={() => this.props.navigation.navigate("QueryRoom")}  >
            <View>
              <MaterialIcons name="question-answer" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* chat end  */}
      </Fragment >
    );
  }
}

const mystyles = StyleSheet.create({
  iconRoundWrapper: {
    borderRadius: 50,
    padding: heightPercentageToDP(1.2),
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginRight: 12,
    marginLeft: 5
  },
  welcomeText: {
    color: WHITE,
    fontSize: heightPercentageToDP(3),
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
    opacity: 1
  },
  userContainer: {
    padding: heightPercentageToDP(2),
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: hp(1)
  },
  userText: {
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
    color: "#fff",
    fontSize: heightPercentageToDP(2.5),
    marginLeft: heightPercentageToDP(2)
  },
  imgBackground: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    height: 300,
  },
  linearGradient: {
    width: '100%',
    height: 300,
    backgroundColor: 'rgba(23,24,70, .9)'
  },
  card: {
    alignSelf: 'center',
    height: 80,
    width: widthPercentageToDP(22),
    borderRadius: 10,
    margin: 5,
    padding: 15
  }

});


const MainScreen = createStackNavigator({
  Main: {
    screen: Main,
    navigationOptions: {
      header: null
    }
  },
  Subject: {
    screen: Subject,
    navigationOptions: {
      header: null,
    }
  },
  QueryRoom: {
    screen: QueryRoom,
    navigationOptions: {
      header: null,
    }
  },
  VideoList: {
    screen: VideoList,
    navigationOptions: {
      header: null
    }
  },
  VideoPlayer: {
    screen: VideoPlayer,
    navigationOptions: {
      header: null
    }
  },
  OTS: {
    screen: OTS,
    navigationOptions: {
      header: null
    }
  },
  Blogs: {
    screen: Blogs,
    navigationOptions: {
      header: null
    }
  },
  PdfViewer: {
    screen: PdfViewer,
    navigationOptions: {
      header: null
    }
  },
  ViewInvoice: {
    screen: ViewInvoice,
    navigationOptions: {
      header: null
    }
  },
  Discussion: {
    screen: Discussion,
    navigationOptions: {
      header: null
    }
  },
  AllChapters: {
    screen: AllChapters,
    navigationOptions: {
      header: null
    }
  },

  Live: {
    screen: Live,
    navigationOptions: {
      header: null
    }
  },
  EventList: {
    screen: EventList,
    navigationOptions: {
      header: null
    }
  },
  LivePlayer: {
    screen: LivePlayer,
    navigationOptions: {
      header: null
    }
  },
  Notification: {
    screen: Notification,
    navigationOptions: {
      header: null
    }
  },
  WatchList: {
    screen: WatchList,
    navigationOptions: {
      header: null
    }
  },
  Videos: {
    screen: Videos,
    navigationOptions: {
      header: null
    }
  },
  Webinar: {
    screen: Webinar,
    navigationOptions: {
      header: null
    }
  },
  YoutubeLive: {
    screen: YoutubeLive,
    navigationOptions: {
      header: null
    }
  },

  Courses: {
    screen: Courses,
    navigationOptions: {
      header: null
    }
  },
  CourseDetails: {
    screen: CourseDetails,
    navigationOptions: {
      header: null
    }
  },
  ExamDetails: {
    screen: ExamsDetails,
    navigationOptions: {
      header: null
    }
  },
  ExamDetailsProductWise: {
    screen: ExamDetailsProductWise,
    navigationOptions: {
      header: null
    }
  },
  CourseDetailProductWise: {
    screen: CourseDetailProductWise,
    navigationOptions: {
      header: null
    }
  },
  SubjectDetails: {
    screen: SubjectDetails,
    navigationOptions: {
      header: null
    }
  },

  Lecture: {
    screen: Lecture,
    navigationOptions: {
      header: null
    }
  },
  PlayList: {
    screen: PlayList,
    navigationOptions: {
      header: null
    }
  },

  YoutubeVideoPlayer: {
    screen: YoutubeVideoPlayer,
    navigationOptions: {
      header: null
    }
  },
  YoutubeHome: {
    screen: YoutubeHome,
    navigationOptions: {
      header: null
    }
  },
  GeniqueFreeCourses: {
    screen: GeniqueFreeCourses,
    navigationOptions: {
      header: null
    }
  },

  AllCourses: {
    screen: AllCourses,
    navigationOptions: {
      header: null
    }
  },

  CourseBuys: {
    screen: CourseBuys,
    navigationOptions: {
      header: null
    }
  },

  CourseBuyFromCart: {
    screen: CourseBuyFromCart,
    navigationOptions: {
      header: null
    }
  },

  CartList: {
    screen: CartList,
    navigationOptions: {
      header: null
    }
  },

  OrderList: {
    screen: OrderList,
    navigationOptions: {
      header: null
    }
  },

  OrderDetail: {
    screen: OrderDetail,
    navigationOptions: {
      header: null
    }
  },

  Checkout: {
    screen: Checkout,
    navigationOptions: {
      header: null
    }
  },

  MyCourseDetail: {
    screen: MyCourseDetail,
    navigationOptions: {
      header: null
    }
  },

  ProductList: {
    screen: ProductList,
    navigationOptions: {
      header: null
    }
  },


})
const Home = createAppContainer(MainScreen)
export default Home

