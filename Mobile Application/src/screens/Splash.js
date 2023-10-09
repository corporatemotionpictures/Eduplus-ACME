import React, { Component } from 'react';
import { View, Image, Text, TouchableHighlight, AsyncStorage, ActivityIndicator, Modal, Alert, StatusBar, Linking, TouchableOpacity } from 'react-native';
import { HEIGHT, WIDTH, BG_COLOR, BLUE, LIGHT_BLUE, NEW_GRAD2, NEW_GRAD1, WHITE } from "../utils/utils"
import { LinearGradient } from "expo-linear-gradient"
import { BASE_URL, checkUserState } from '../utils/configs';
import SplashScreen from "react-native-splash-screen"
import { AntDesign, Entypo } from "@expo/vector-icons"
import changeNavigationBarColor from "react-native-navigation-bar-color"
import VersionCheck from 'react-native-version-check'
import { setCustomText, setCustomTextInput } from 'react-native-global-props';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import LottieView from "lottie-react-native";
import PushNotification from "react-native-push-notification";
import firebase from "react-native-firebase"

//import Text from './components/CustomFontComponent';

const customTextProps = {
  style: {
    fontFamily: 'Roboto-Regular',
  }
}

setCustomText(customTextProps);
setCustomTextInput(customTextProps);


export default class Splash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      splashTime: true,
      updateModal: false,
      startloading: false,
      addtoloading: false,
      appUrl: ''
    };
  }

  async componentDidMount() {
    this.notifyUser();
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        this.setState({ addtoloading: false })
        setTimeout(() => {
          SplashScreen.hide()
        }, 1000)
      },
    );
  }

  componentWillUnmount() {
    this.didFocusListener.remove();
  }

  notifyUser = async () => {
    let { navigation } = this.props

    PushNotification.configure({
      onRegister: function (token) {
        console.log("FCM TOKEN Splash:", token);
        //Alert.alert(token);
      },
      onNotification: function (notification) {
        // console.warn(notification)
        // Alert.alert("notification coming from Appp")
        console.log("Action >>>>>>>", notification.action)
        // console.warn("this is the notification inside notification function >>>>", notification)
        if (notification.action) {
          navigation.navigate(notification.action);
        }
      },

      onAction: function (notification) {
        // handleNotification(notification)
        console.log("ACTION >>>>>>>>>>>>>>>>>>>>>>>>>>:", notification.action);
        // Alert.alert("ASDASD")
      },
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },


      // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
      //senderID: "368627312946",
      // senderID: "190409861416",

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true
    });
    try {
      const permission = await firebase.messaging().requestPermission();
      if (permission) {
        // alert("You Will Recieve Push Notification ")
      }

    } catch (error) {
      // Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
    }
  }


  checkAuth = () => {
    this.setState({ addtoloading: true })
    AsyncStorage.getItem("user_token").then((token) => {
      console.log(token)
      if (token) {
        //this.props.navigation.navigate("Login")
        checkUserState(token).then(data => {
          if (!data.success) {
            Alert.alert(data.message)
            this.props.navigation.navigate("Login")
            this.setState({ startloading: false })
            AsyncStorage.clear()
          } else {
            this.props.navigation.navigate("Home")
            //this.setState({ startloading: false })
          }
        })
      } else {
        this.props.navigation.navigate("Login")
        //this.setState({ startloading: false })
      }
    });
  }
  async componentWillMount() {
    console.log("CALL")
    this.setState({ addtoloading: false })
    const currentVersion = VersionCheck.getCurrentVersion();
    console.log(currentVersion)

    // VersionCheck.getLatestVersion().then((ver) => {
    //   console.log(ver)
    //   if (currentVersion < ver) {
    //     VersionCheck.getAppStoreUrl({
    //       appID: 'eduplus.www.acmeacademy.in',
    //       ignoreErrors: true
    //     }).then(url => {
    //       this.setState({
    //         updateModal: true,
    //         appUrl: url
    //       });
    //     })
    //   } else {
    //     console.log("NO VERSION CHANGE")
    //   }
    // })

    StatusBar.setBackgroundColor(BG_COLOR)
    await changeNavigationBarColor(BG_COLOR, false);

    this.loadingSplashcontent();
  }

  loadingSplashcontent = async () => {
    await fetch(`${BASE_URL}/api/v1/settings/SplashScreen`, {
      method: "GET",
    })
      .then(response => response.json())
      .then((response) => {
        this.setState({
          splashheader: response.value.SplashHeader,
          splashsubheader: response.value.SplashSubHeader,
          splashtitle: response.value.SplashText,
          //loading: true
          //,()=>{this.state.quotesvalue}
        })
        console.log("LOADING SPLASH CONTENT IN SPLASH")
        console.log(this.state.splashheader)
        console.log(this.state.splashtitle)
      })
      .catch(err => {
        console.error(err);
        Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
      });
  }


  static navigationOptions = {
    header: null
  }

  sendPlayStore = () => {
    Linking.openURL("market://details?id=eduplus.www.acmeacademy.in");
  }

  render() {
    return (
      <View style={{ flex: 1, width: WIDTH, height: HEIGHT, backgroundColor: WHITE }}>
        <StatusBar backgroundColor={BG_COLOR} />
        <View style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, justifyContent: "flex-start", alignItems: 'center' }}>
          <Image source={{ uri: `${BASE_URL}/cdn/splash/splash-screen.png` }} style={{ height: (HEIGHT / 2) + 100, width: WIDTH, position: "absolute", top: -heightPercentageToDP(2), left: 0, right: 0, resizeMode: 'cover' }} />
          {/* <Image source={require("../../assets/Get-Started.png")} style={{ height: (HEIGHT / 2) + 100, width: WIDTH, position: "absolute", top: -heightPercentageToDP(2), left: 0, right: 0, resizeMode: 'cover' }} /> */}
          <Image source={require("../../assets/Logo-light.png")} style={{ height: 120, width: 150, resizeMode: 'contain', position: "absolute", top: -5, left: 25, right: 0 }} />
        </View>
        <View style={{ padding: 20, position: 'absolute', bottom: 100, left: 0, right: 0 }}>
          {/* <Text allowFontScaling={false} style={{ color: "white", fontSize: 35, fontFamily:'Roboto-Regular', }}>Welcome to{"\n"}<Text style={{ color: "white", fontSize: 35,fontFamily:'Roboto-Black' }}>Medico Mentors</Text></Text>
            <Text allowFontScaling={false} style={{ textAlign:'justify', color: "white", marginTop: 10, fontSize:heightPercentageToDP(2), width: WIDTH / 1.2, lineHeight:25, fontFamily:'Roboto-Regular' }}>As an academy with our constant effort to provide the MBBS and NEXT aspirants with best Online study materials and guidance. </Text> */}
          <Text allowFontScaling={false} style={{ color: BG_COLOR, fontSize: 35, fontFamily: 'Roboto-Regular', }}>{this.state.splashheader}{"\n"}<Text style={{ color: BG_COLOR, fontSize: 35, fontFamily: 'Roboto-Black' }}>{this.state.splashsubheader}</Text></Text>
          <Text allowFontScaling={false} style={{ textAlign: 'justify', color: BG_COLOR, marginTop: 10, fontSize: heightPercentageToDP(2), width: WIDTH / 1.2, lineHeight: 25, fontFamily: 'Roboto-Regular' }}>{this.state.splashtitle}</Text>
        </View>

        {this.state.addtoloading ?
          <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', bottom: 20, right: 20, height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2 }} >
            <ActivityIndicator color="white" />
          </LinearGradient>
          :
          <TouchableHighlight onPress={this.checkAuth} style={{ position: 'absolute', bottom: 20, right: 20, height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2 }} >
            <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', height: 60, width: 60, borderRadius: 30, }} >
              <TouchableOpacity onPress={this.checkAuth}>
                <AntDesign name="arrowright" size={24} color="white" style={{}} />
              </TouchableOpacity>
            </LinearGradient>
          </TouchableHighlight>}

        <Modal visible={this.state.updateModal} transparent >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
            <View style={{ backgroundColor: 'black', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: .5 }} />
            <View style={{ backgroundColor: 'white', height: HEIGHT / 1.5, width: widthPercentageToDP(80), borderRadius: 5, padding: widthPercentageToDP(5), alignItems: 'center' }}>
              <LottieView
                autoPlay
                source={require("../utils/versionupdate.json")}
                style={{ height: 150, width: 150 }}
              />
              <View style={{ width: WIDTH, paddingLeft: widthPercentageToDP(10) }}>
                <Text numberOfLines={1} style={{ fontSize: heightPercentageToDP(3.5), fontFamily: 'Roboto-Bold', fontWeight: 'bold', textAlign: 'left', marginLeft: 15, color: "#00a2ff", width: widthPercentageToDP(70) }}>We are better then ever</Text>
              </View>

              <View style={{ width: WIDTH, paddingLeft: widthPercentageToDP(10) }}>
                <Text style={{ fontSize: heightPercentageToDP(2), textAlign: 'left', marginTop: 10, marginLeft: 15, color: "#353535" }}>Dear user,</Text>
                <Text numberOfLines={5} style={{ fontSize: heightPercentageToDP(2), marginLeft: 15, marginTop: 10, color: "#353535", width: widthPercentageToDP(65) }}>
                  The version of the app is too old now. You need to update the app inorder to experience the multifunction.
                </Text>
                <Text numberOfLines={5} style={{ marginTop: 10, fontSize: heightPercentageToDP(2), marginLeft: 15, marginTop: 10, color: "#353535", width: widthPercentageToDP(70) }}>
                  To use this app, download the latest version.
                </Text>
              </View>

            </View>
            <View style={{ width: WIDTH, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={this.sendPlayStore} style={{ width: widthPercentageToDP(70), height: heightPercentageToDP(7), borderRadius: 5, backgroundColor: "#009f3c", justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 20 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Entypo name="google-play" size={18} color="white" style={{}} />
                  <Text style={{ color: 'white', marginLeft: 5, marginTop: 2 }}>UPDATE NOW</Text>
                </View>

              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>

    );
  }
}



