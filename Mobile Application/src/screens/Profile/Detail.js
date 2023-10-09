import React, { Component, Fragment } from 'react';
import { View, RefreshControl, Image, TouchableOpacity, ScrollView, Switch, AsyncStorage, Alert, ImageBackground } from 'react-native';
import { styles, Header, GREY, LIGHTGREY, LIGHT_GREY, WIDTH, GREEN, BG_COLOR, SECONDARY_COLOR, BLUE, LIGHT_GREEN, LIGHT_BLUE, NEW_GRAD1, NEW_GRAD2, WHITE, BLACK, ORANGES, ORANGE, LOGIN_BG } from '../../utils/utils';
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { fetchUserDetails, BASE_URL, fetchTestSeries, fetchVideoSeries, checkVideoThreshold, fetchOrderList, fetchCartList } from '../../utils/configs';
import Loader from '../../utils/Loader';
import LottieView from "lottie-react-native"
import Background from '../../utils/Background';
import PieChart from 'react-native-pie-chart';
import { LinearGradient } from "expo-linear-gradient"
import { heightPercentageToDP as hp, widthPercentageToDP as wp, heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
// import Text from '../components/CustomFontComponent'
import { StyleSheet } from 'react-native'
// import * as Progress from 'react-native-progress';
import { AntDesign } from '@expo/vector-icons';
import { Block, Card, Text } from "expo-ui-kit"

export default class Detail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userDetails: {},
      user_id: '',
      filePath: "",
      fileData: "",
      fileUri: "",
      fileName: "",
      fileType: "",
      id: null,
      profile: null,
      loading: true,
      testGiven: null,
      totalTest: null,
      courseProgress: null,
      totalVideo: null,
      videoThresold: 0,
      videoViews: 0
    };
  }

  componentWillMount() {
    AsyncStorage.getItem("user_token").then(token => {
      checkVideoThreshold(token).then(data => {
        console.log("CHECKVIDEOTHRESHOLD")
        console.log(data)
        if (data.success) {
          this.setState({
            videoThresold: data.video_view_limit,
            videoViews: data.video_count
          })
        }
      })

      fetchTestSeries(token).then(data => {
        console.log("TestSeries")
        console.log(data)
        if (data.success) {
          this.setState({
            testGiven: data.student_exam_count,
            totalTest: data.exam_count
          })
        } else {
          Alert.alert("Network error")
        }
      });

      fetchVideoSeries(token).then(data => {
        console.log("VIDEOSERIES")
        console.log(data)
        if (data.success) {
          this.setState({
            totalVideo: data.video_count,
            courseProgress: data.student_video_count
          })
        } else {
          Alert.alert("Network error")
        }
      });

      fetchOrderList(token).then(data => {
        if (data.success) {
          this.setState({
            orderlist: data.orders,
            loading: false
          })
          console.log("ORDERS LISTING")
          console.log(this.state.orderlist.length)
        }
      })

      fetchCartList(token).then(data => {
        if (data.success) {
          this.setState({
            cartlist: data.carts,
            cartprice: data,
            loading: false
          })
          console.log("CART LENGTH")
          console.log(this.state.cartlist.length)
        }
      })

      AsyncStorage.getItem("user_id").then((res) => {
        console.log(res)
        this.setState({ user_id: res })
        fetchUserDetails(res, token).then((res) => {
          if (res.success) {
            console.log(res.user)
            this.setState({
              userDetails: res.user,
              userAddress: res.user.addresses,
              userAcademic: res.user.academic_details,
              loading: false
            })

            console.log("FASAFDFASDASDASDA>>>>>>>>>>>>>")
            console.log(this.state.userDetails.dob)
          }
          else {
            this.setState({
              loading: false
            })
            Alert.alert(res.error)
          }
        })
      })
    });
  }

  logOut = async () => {
    AsyncStorage.clear().then(() => {
      this.props.navigation.navigate("Login")
      Alert.alert("You are Logged Out !")
    })
  }

  onRefresh = () => {
    this.componentWillMount()
  }

  render() {
    var a = new Date(this.state.userDetails.dob);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = date + ' ' + month + ' ' + year;

    console.log("DATE OF BIRTH")
    console.log(time)

    {
      time == isNaN ?
        console.log(this.state.userDetails.dob)
        :
        console.log(time)
    }

    const chart_wh = wp("24%")
    const testseries = this.state.testGiven == null ? [0, 1] : [isNaN(((this.state.testGiven / this.state.totalTest) * 100) / 100) ? 0 : ((this.state.testGiven / this.state.totalTest) * 100) / 100, isNaN((100 - (Math.round((this.state.testGiven / this.state.totalTest) * 100))) / 100) ? 1 : (100 - (Math.round((this.state.testGiven / this.state.totalTest) * 100))) / 100];
    const videoSeries = this.state.totalVideo == null ? [0, 1] : [isNaN((Math.round((this.state.courseProgress / this.state.totalVideo) * 100)) / 100) ? 0 : (Math.round((this.state.courseProgress / this.state.totalVideo) * 100)) / 100, isNaN((100 - (Math.round((this.state.courseProgress / this.state.totalVideo) * 100))) / 100) ? 0 : (100 - (Math.round((this.state.courseProgress / this.state.totalVideo) * 100))) / 100];
    const videoCount = this.state.videoThresold == 0 ? [0, 1] : [isNaN((Math.round((this.state.videoViews / this.state.videoThresold) * 100)) / 100) ? 0 : (Math.round((this.state.videoViews / this.state.videoThresold) * 100)) / 100, isNaN((100 - (Math.round((this.state.videoViews / this.state.videoThresold) * 100))) / 100) ? 0 : (100 - (Math.round((this.state.videoViews / this.state.videoThresold) * 100))) / 100];
    const sliceColor = [BG_COLOR, "#cfcfcf"];
    console.log(testseries)
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>" + videoSeries)
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<" + videoCount)

    return this.state.loading ? <Loader /> : (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* <Background /> */}

        {/* <Header title="My Account" onPress={() => this.props.navigation.push("Settings", { userDetails: this.state.userDetails, user_id: this.state.user_id })} rightIcons={[<MaterialIcons onPress={() => this.props.navigation.navigate("WatchList")} name={"bookmark"} size={20} color={"white"} style={{ right: 18, position: 'absolute' }} />]} /> */}
        <ScrollView refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />} showsVerticalScrollIndicator={false}>
          {/* <View style={{
            backgroundColor: BG_COLOR,
            height: 150,
            width: WIDTH
          }}>
            <View style={{
              flexDirection: 'row',
              margin: 10,
              alignItems: 'center',
              width: WIDTH,
              paddingRight: 50,
              justifyContent: 'space-between'
            }}>
              <View style={{ flexDirection: 'column' }}>
                <Text style={{ fontSize: 35, color: "white", fontFamily: 'Roboto-Regular' }} >Hello,</Text>
                <Text style={{ fontSize: 35, fontWeight: '200', color: "white", fontFamily: 'Roboto-Bold' }}>
                  {this.state.userDetails.first_name}
                </Text>
              </View>
              <LottieView
                autoPlay
                source={require("../../utils/ProfileAnimation.json")}
                style={{ height: 140, width: 140, }}
                resizeMode="contain"
                hardwareAccelerationAndroid
              />
            </View>

          </View> */}

          <ImageBackground source={{ uri: `https://res.cloudinary.com/twenty20/private_images/t_standard-fit/v1588713988/photosp/ed8d2e01-f128-49f1-9529-7c81f4c8b354/ed8d2e01-f128-49f1-9529-7c81f4c8b354.jpg` }} style={{ height: heightPercentageToDP(15), width: widthPercentageToDP(100) }} >
            <LinearGradient colors={[BG_COLOR, '#5654EE']} start={[0.1, 0.1]} style={{ position: 'absolute', left: 0, bottom: 0, right: 0, opacity: .9, height: heightPercentageToDP(15), }} >
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Main')}>
                  <AntDesign name="left" size={24} color="white" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
                <Text numberOfLines={2} style={{ color: WHITE, marginHorizontal: heightPercentageToDP(3), fontSize: heightPercentageToDP(3), fontWeight: 'bold' }}>My Profile</Text>
              </View>
            </LinearGradient>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("CartList")}>
              <View>
                <AntDesign name="shoppingcart" size={27} color="white" style={{ alignItems: 'center', justifyContent: 'center', alignContent: 'center', marginTop: heightPercentageToDP(6), textAlign: 'right', marginRight: 15 }} />
              </View>
            </TouchableOpacity>
          </ImageBackground>
          <View style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: "#fff", marginTop: heightPercentageToDP(-3) }}>
            <View style={myStyles.userContainer}>
              <Image source={require("../../../assets/user.png")} style={{ width: 60, height: 60, borderWidth: 1, borderColor: "#fff", borderRadius: 50 }} />
              <View>
                <Text style={myStyles.userText} numberOfLines={2}>{this.state.userDetails.first_name}</Text>
                {this.state.userDetails.email == undefined ? null :
                  <Text style={{ color: BLACK, fontSize: 10, fontFamily: 'Roboto-Regular', width: undefined, marginLeft: hp(1.5), marginTop: hp(0.4) }}> {this.state.userDetails.email} </Text>
                }

                {this.state.userDetails.mobile_number == undefined ?
                  null
                  :
                  <Text style={{ color: BLACK, fontSize: 10, fontFamily: 'Roboto-Regular', width: undefined, marginLeft: hp(1.5), marginTop: hp(0.4) }}> {this.state.userDetails.mobile_number}  </Text>
                }
              </View>
            </View>

            {/* start */}

            {this.state.courseProgress != null ? <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center', width: WIDTH - 30, padding: 10, flexDirection: "row", borderRadius: 10, marginTop: 0, borderWidth: 1, borderColor: '#f2f2f2', paddingBottom: 20, backgroundColor: "rgba(238, 238, 238, 0.4)", alignSelf: 'center' }}>
              {this.state.videoViews == null && this.state.videoThresold == null ? null : <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', color: BG_COLOR, margin: 10, fontSize: 12 }}>Test Series</Text>
                <PieChart
                  chart_wh={chart_wh}
                  series={testseries}
                  sliceColor={sliceColor}
                  doughnut={true}
                  coverRadius={.8}
                  coverFill={"white"}
                />
                <View style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: hp("1.8%"), color: GREY, marginTop: 40, fontWeight: 'bold' }}>{!isNaN(Math.round((this.state.testGiven / this.state.totalTest) * 100)) ? Math.round((this.state.testGiven / this.state.totalTest) * 100) : 0}%</Text>
                </View>
              </View>}
              {this.state.videoViews == null && this.state.videoThresold == null ? null : <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', color: BG_COLOR, margin: 10, fontSize: 12 }}>Video Completed</Text>
                <PieChart
                  chart_wh={chart_wh}
                  series={videoCount}
                  sliceColor={sliceColor}
                  doughnut={true}
                  coverRadius={.8}
                  coverFill={"#f2f2f2"}
                />
                <View style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: hp("1.8%"), color: BG_COLOR, marginTop: 40, fontWeight: 'bold' }}>{!isNaN(Math.round((this.state.videoViews / this.state.videoThresold) * 100)) ? Math.round((this.state.videoViews / this.state.videoThresold) * 100) : 0}%</Text>
                </View>
              </View>}
              {this.state.videoViews == null && this.state.videoThresold == null ? null : <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', color: BG_COLOR, margin: 10, fontSize: 12 }}>Video Views</Text>

                <PieChart
                  chart_wh={chart_wh}
                  series={videoCount}
                  sliceColor={sliceColor}
                  doughnut={true}
                  coverRadius={.8}
                  coverFill={"#f2f2f2"}
                />
                <View style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: hp("1%"), color: BG_COLOR, marginTop: 40, fontWeight: 'bold' }}><Text style={{ fontSize: hp("1.8%"), color: BG_COLOR, marginTop: 40, fontWeight: 'bold' }} >{this.state.videoViews}</Text>/{this.state.videoThresold}</Text>
                </View>
              </View>}
            </View> : null}

            {/* <Block row padding={heightPercentageToDP(1)} space="evenly" >
              {this.state.videoViews == null ? null : (
                <Card
                  center
                  height={heightPercentageToDP(13)}
                  width={widthPercentageToDP(40)}
                  color="#FFF8E6"
                  margin={5}
                  radius={4}
                  middle
                  padding>
                  <Text subtitle>Videos Completed</Text>
                  <Text h2 color='#FF7438' bold>{!isNaN(Math.round((this.state.videoViews / this.state.videoThresold) * 100)) ? Math.round((this.state.videoViews / this.state.videoThresold) * 100) : 0}% </Text>
                </Card>
              )}


              {this.state.videoViews == null && this.state.videoThresold == null ? null : (
                <Card
                  center
                  height={heightPercentageToDP(13)}
                  width={widthPercentageToDP(40)}
                  radius={4}
                  middle
                  color="#E6F3F1"
                  margin={5}>
                  <Text subtitle>Videos Views</Text>
                  <Text h2 color="#239983" bold>{this.state.videoViews + "/" + this.state.videoThresold}</Text>
                </Card>
              )}

            </Block> */}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: heightPercentageToDP(10), marginTop: heightPercentageToDP(1), paddingLeft: 5 }}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("OrderList")} activeOpacity={.8}>
                <LinearGradient start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 1 }} colors={["#ef2b73", "#f56c3e"]} style={{ width: widthPercentageToDP(46), height: heightPercentageToDP(6), justifyContent: 'center', alignItems: 'center', borderRadius: widthPercentageToDP(1.5), margin: heightPercentageToDP(1), elevation: 4, flexDirection: 'row' }}>
                  <Image source={require("../../../assets/clipboard.png")} style={{ height: heightPercentageToDP(3), width: heightPercentageToDP(3), marginRight: 10 }} />
                  <Text style={{ color: 'white', fontSize: heightPercentageToDP(2.8) }}>
                    My Order
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("ReferAndEarn")} activeOpacity={.8}>
                <LinearGradient start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 1 }} colors={["#8eba3d", "#49a043"]} style={{ width: widthPercentageToDP(46), height: heightPercentageToDP(6), justifyContent: 'center', alignItems: 'center', borderRadius: widthPercentageToDP(1.5), marginRight: heightPercentageToDP(2), elevation: 4, flexDirection: 'row' }}>
                  <Image source={require("../../../assets/discount.png")} style={{ height: heightPercentageToDP(3), width: heightPercentageToDP(3), marginRight: 10 }} />
                  <Text style={{ color: 'white', fontSize: heightPercentageToDP(2.5), margin: 5 }}>
                    Refer {"&"} Earn
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', justifyContent:'center', alignContent:'center', alignSelf:'center', height: heightPercentageToDP(10), marginTop: heightPercentageToDP(4.5), position: 'absolute', top: 240, }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("ReferAndEarn")} activeOpacity={.8}>
                <LinearGradient start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 1 }} colors={["#e53935", "#e35d5b",]} style={{ width: widthPercentageToDP(46), height: heightPercentageToDP(6), marginTop:60, justifyContent: 'center', alignItems: 'center', alignSelf:'center', alignContent:'center', textAlign:'center', borderRadius: widthPercentageToDP(1.5), marginRight: heightPercentageToDP(2), elevation: 4, flexDirection: 'row', marginLeft:8 }}>
                  <Image source={require("../../../assets/discount.png")} style={{ height: heightPercentageToDP(3), width: heightPercentageToDP(3), marginRight: 10 }} />
                  <Text style={{ color: 'white', fontSize: heightPercentageToDP(2.5), margin: 5 }}>
                  Refer And Earn
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View> */}

            <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', marginTop: heightPercentageToDP(1) }} >
              <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> Registration no.  </Text>
              {this.state.userDetails.registration_number == undefined ?
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> NA </Text>
                :
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> {this.state.userDetails.registration_number}</Text>
              }

            </TouchableOpacity>
            {/* <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', justifyContent: 'space-between', paddingRight: wp("8%"), borderTopColor: '#ececec', borderTopWidth: .5 }} >
              <Text style={{ color: 'grey', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> Package </Text>
              {this.state.userDetails.package == undefined ? <Text style={{ color: 'black', fontSize: 14, textAlign: 'right', width: (WIDTH / 2) - 40 }} ></Text> : <Text style={{ color: 'white', fontSize: 13, fontFamily:'Roboto-Bold', textAlign: 'right', backgroundColor: LIGHT_GREEN, borderRadius: 1, padding: 2 }}> {this.state.userDetails.package}  </Text>}
            </TouchableOpacity> */}

            <TouchableOpacity style={{ width: WIDTH, padding: 18, flexDirection: 'row', borderTopColor: '#ececec', borderTopWidth: .5 }} >
              <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> Username  </Text>
              {this.state.userDetails.first_name == undefined ?
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> NA </Text>
                :
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> {this.state.userDetails.first_name} {this.state.userDetails.last_name} </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', justifyContent: 'space-between', borderTopColor: '#ececec', borderTopWidth: .5 }} >
              <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: undefined }}> Email  </Text>
              {this.state.userDetails.email == undefined ?
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: undefined }}> NA </Text>
                :
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: undefined }}> {this.state.userDetails.email} </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', borderTopColor: '#ececec', borderTopWidth: .5 }} >
              <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> Mobile Number </Text>
              {this.state.userDetails.mobile_number == undefined ?
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> NA  </Text>
                :
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> {this.state.userDetails.mobile_number}  </Text>
              }

            </TouchableOpacity>

            {this.state.userAddress == undefined || this.state.userAddress.length == 0 ? null :
              <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', borderTopColor: '#ececec', borderTopWidth: .5 }} >
                <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> Address </Text>
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> {this.state.userAddress[0].address}  </Text>
              </TouchableOpacity>}

            {this.state.userAddress == undefined || this.state.userAddress.length == 0 ? null :
              <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', borderTopColor: '#ececec', borderTopWidth: .5 }} >
                <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> City </Text>
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> {this.state.userAddress[0].city}  </Text>
              </TouchableOpacity>}

            {this.state.userAddress == undefined || this.state.userAddress.length == 0 ? null :
              <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', borderTopColor: '#ececec', borderTopWidth: .5 }} >
                <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> State </Text>
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> {this.state.userAddress[0].state}  </Text>
              </TouchableOpacity>}

            {this.state.userAcademic == undefined || this.state.userAcademic.length == 0 ? null :
              <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', borderTopColor: '#ececec', borderTopWidth: .5 }} >
                <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> Institute </Text>
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> {this.state.userAcademic[0].institute}  </Text>
              </TouchableOpacity>}


            <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', borderTopColor: '#ececec', borderTopWidth: .5 }} >
              <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> Batch Year </Text>
              {this.state.userDetails.year == undefined ?
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> NA  </Text>
                :
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> {this.state.userDetails.year}  </Text>
              }

            </TouchableOpacity>

            {this.state.userAcademic == undefined || this.state.userAcademic.length == 0 ? null :
              <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', borderTopColor: '#ececec', borderTopWidth: .5 }} >
                <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> Passing Year </Text>
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> {this.state.userAcademic[0].passing_year}  </Text>
              </TouchableOpacity>}

            {isNaN(time) ? <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', borderTopColor: '#ececec', borderTopWidth: .5, paddingBottom: 30 }} >
              <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> DOB  </Text>
              <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> {this.state.userDetails.dob}  </Text>
            </TouchableOpacity>
              :
              <TouchableOpacity style={{ padding: 18, width: WIDTH, flexDirection: 'row', borderTopColor: '#ececec', borderTopWidth: .5, paddingBottom: 30 }} >
                <Text style={{ color: 'black', fontSize: 14, textAlign: 'left', width: WIDTH / 2 }}> DOB  </Text>
                <Text style={{ color: 'grey', fontSize: 13, fontFamily: 'Roboto-Bold', textAlign: 'right', width: (WIDTH / 2) - 40 }}> {time}  </Text>
              </TouchableOpacity>
            }

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: heightPercentageToDP(2.5) }}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("RaiseTicket")} style={{ justifyContent: 'center', alignItems: 'center', width: WIDTH - 20, padding: 10, borderRadius: 4, backgroundColor: BLUE, height: 40 }}>
                <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} >
                  <Text style={{ color: "white" }}>Raise Ticket</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

      </View>
    );

  }
}


const myStyles = StyleSheet.create({
  card: {
    borderRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    width: widthPercentageToDP(96),
    margin: heightPercentageToDP(1),
    padding: heightPercentageToDP(2),
    backgroundColor: '#fff',
    opacity: 1,
    height: heightPercentageToDP(29)

  },
  title: {
    color: BLACK,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Regular',
    fontSize: heightPercentageToDP(3),
    marginBottom: heightPercentageToDP(2)
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  iconWrapper: {
    position: "absolute",
    top: -136,
    left: 140,
    borderRadius: 50,
    // backgroundColor: 'rgba(255,255,255,0.5)',
  }, welcomeText: {
    color: BLACK,
    fontSize: heightPercentageToDP(2.5),
    fontWeight: 'bold'
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
    color: "#000",
    fontSize: heightPercentageToDP(2.5),
    marginLeft: heightPercentageToDP(2)
  }

});
