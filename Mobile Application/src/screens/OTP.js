import React, { Component } from 'react';
import { View, Text, Platform, ImageBackground, Image, SafeAreaView, TouchableHighlight, KeyboardAvoidingView, AsyncStorage, Alert, TouchableOpacity, Modal, ScrollView, StatusBar, Keyboard, ActivityIndicator } from 'react-native';
import { ApplicationProvider, Layout, Input, Button, } from "@ui-kitten/components"
import { mapping, dark as darkTheme } from '@eva-design/eva';
import { MaterialCommunityIcons } from "@expo/vector-icons"

import { HEIGHT, WIDTH, GREEN, GREY, Header, styles, LIGHT_BLUE, BLUE, ORANGE, GRAD1, GRAD2, BG_COLOR, SECONDARY_COLOR, LIGHTGREY, BLUE_UP, WHITE, NEW_GRAD1, NEW_GRAD2, YELLOW } from '../utils/utils';
import { BASE_URL, CLIENT_ID, FACEBOOK_CLIENT_ID, GOOGLE_CLIENT_ID, checkUserAuth, raiseTicketWithoutLogin } from '../utils/configs';
import { LinearGradient } from "expo-linear-gradient"
import AwesomeAlert from 'react-native-awesome-alerts';
import OtpInputs from "react-native-otp-inputs"
import DeivceInfo, { getDeviceId, getUniqueId, getSerialNumberSync, getSerialNumber } from "react-native-device-info"
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import RNOtpVerify from 'react-native-otp-verify';
import Video from 'react-native-video';


export default class OTP extends Component {

  constructor(props) {
    super(props);
    this.state = {
      otp: '',
      user_id: this.props.navigation.state.params.user_id,
      user_name: this.props.navigation.state.params.user_name,
      deviceID: getUniqueId(),
      showLoginAlert: false,
      showLoginError: false,
      timer: 60,
      errormessage: '',
      hashval: ''
    };
  }

  getHash = () =>
    RNOtpVerify.getHash()
      .then((val) => {
        console.log("HASH VAL>>>>>> " + val)
        this.setState({
          hashval: val
        })
        //Alert.alert(val)
      })
      .catch(console.log);


  otpHandler = (message) => {
    console.log("MESSAGE " + message)
    //try {
    if (message && message !== 'Timeout Error') {
      const otp = /(\d{4})/g.exec(message)[1]
      console.log("SOMETHING")
      console.log(otp)
      this.setState({ otp })
      RNOtpVerify.removeListener()
      this.verifyUser()
      Keyboard.dismiss()
    }
    else {
      console.log('OTPVerification: RNOtpVerify.getOtp - message=>', message);
      Alert.alert("Sorry", "You are not authorized to use this App")
    }
    //   }
    //  catch (error) {
    //   console.log('OTPVerification: RNOtpVerify.getOtp error=>', error );
    // }

  }

  // startListeningForOtp = () =>
  //     RNOtpVerify.getOtp()
  //       .then(p => {
  //     RNOtpVerify.addListener(this.otpHandler)
  //     console.log("CALLING")
  //     })
  //   .catch(p => Alert.alert(p));
  startListeningForOtp = () =>
    RNOtpVerify.getOtp()
      .then(p => RNOtpVerify.addListener(this.otpHandler))
      .catch(p => console.log(p));


  // componentWillMount(){
  //   this.getHash()
  //   this.startListeningForOtp()
  // }

  componentWillMount() {
    this.startListeningForOtp()
    this.getHash()
    const id = DeivceInfo.getUniqueId()
    this.setState({
      deviceID: id
    })
    console.log(this.props.navigation.state.params)
  }

  componentWillUnmount() {
    RNOtpVerify.removeListener();
  }


  componentDidMount() {
    this.interval = setInterval(
      () => this.setState((prevState) => ({ timer: prevState.timer - 1 })),
      1000
    );
  }

  componentDidUpdate() {
    if (this.state.timer === 1) {
      clearInterval(this.interval);
    }
  }


  reSendOTP = async () => {
    this.componentDidMount()
    this.setState({
      loading: true,
      timer: 60
    });
    await fetch(`${BASE_URL}/api/v1/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.state.user_id
        //id: 302
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)

        if (res.success) {
          ToastAndroid.show("OTP Resend Successfully!", ToastAndroid.SHORT);
          this.componentWillMount();
          this.setState({
            loading: false,
            user_id: res.user.id
          });
        } else if (res.success == false) {
          console.log("RESEND NOT WORKING")
          console.log(res.error)
          //Alert.alert(res.error)
          this.setState({ errormessage: res.error })
          this.setState({
            showLoginError: true,
            errormessage: res.error
          })
          //"uuid": "0a8b26412d8d2d13"
        }
        else {
          this.setState({
            loading: false,
            showErrorAlert: true,
          })
        }
      }).catch((err) => {
        this.setState({
          loading: false,
          showErrorAlert: true
        })
      })
  }



  verifyUser = () => {
    console.log("VERIFICATION DETAIL")
    console.log({
      ver_code: this.state.otp,
      id: this.state.user_id,
      uuid: this.state.deviceID
    })
    console.log(this.state.deviceID);
    fetch(`${BASE_URL}/api/v1/auth/varify-otp`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ver_code: this.state.otp,
        id: this.state.user_id,
        uuid: this.state.deviceID
      })
    })
      .then((res) => res.json())
      .then((res) => {
        //console.log(res)
        if (res.success) {
          // console.log(res.OtsAccessToken)
          // console.log(JSON.stringify(res.OtsAccessToken))
          AsyncStorage.setItem("user_token", res.token)
          AsyncStorage.setItem("user_name", res.user.first_name)
          AsyncStorage.setItem("ots_token", res.OtsAccessToken)
          AsyncStorage.setItem("user_id", this.state.user_id.toString()).then(() => {
            this.props.navigation.navigate("Main")
          });
        }
        else if (res.success == false) {
          console.log(res.error)
          this.setState({ errormessage: res.error })
          this.setState({
            showLoginError: true
          })
        }
      })
      .catch((error) => {
        this.setState({
          showLoginError: true
        })
      });
  }


  render() {
    return (
      <ApplicationProvider
        mapping={mapping}
        theme={darkTheme}>
        <Layout style={{ flex: 1, height: HEIGHT, backgroundColor: BG_COLOR }}>
          <StatusBar translucent={true} backgroundColor={"transparent"} />
          {/* <ImageBackground source={require("../../assets/Background.jpg")}  style={{ flex: 1, backgroundColor:"#21338a",height:HEIGHT}}> */}
          <KeyboardAvoidingView style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }} >
            {/* <Image source={require("../../assets/splash-min.png")} style={{ height: (HEIGHT / 2) + 100, width: WIDTH - 30, resizeMode: 'contain', }} /> */}
            <Video
              source={require("../../assets/login-bg.mp4")}
              style={{
                width: WIDTH, height: '100%',
                position: 'absolute',
              }}
              repeat
              resizeMode="cover"
            />
            {/* <Text style={{color:'white', fontSize:heightPercentageToDP(2), top: -220, textAlign:'right', justifyContent:'flex-end', alignContent:'flex-end', alignItems:'flex-end', alignSelf:'flex-end', marginRight:-20, transform: [{ rotate: '270deg' }],marginBottom:0, marginTop:-150}}>{this.state.hashval}</Text> */}
            {/* <Image source={{ uri: `${BASE_URL}/cdn/splash/splash-screen.png` }} style={{ height: (HEIGHT / 2) + 100, width: WIDTH, resizeMode: 'cover', top: -heightPercentageToDP(2) }} /> */}
            <Text style={{ color: 'white', fontSize: heightPercentageToDP(1.2), position: 'absolute', textAlign: 'right', justifyContent: 'flex-end', alignContent: 'flex-end', alignItems: 'flex-end', alignSelf: 'flex-end', right: -14, transform: [{ rotate: '270deg' }], marginTop: 120 }}>{this.state.hashval}</Text>
            <Image source={require("../../assets/Logo-light.png")} style={{ height: 200, width: 240, resizeMode: 'contain', position: "absolute", top: 50, bottom: 50, alignSelf: 'center' }} />
            {/* <Text style={{fontSize: widthPercentageToDP("20%"), textAlign:'center', justifyContent:'center', alignContent:'center', alignItems:'center', alignSelf:'center', color: 'white',  marginTop: heightPercentageToDP(1),fontFamily:'Roboto-Bold'}}>Verify OTP</Text> */}
            <View style={{ height: HEIGHT, width: WIDTH, backgroundColor: WHITE, borderTopLeftRadius: 20, borderTopRightRadius: 30, marginTop: heightPercentageToDP(40) }}>
              {/* <View style={{ height: hp("30%"), position: 'absolute', top: hp("4%"), alignItems: 'flex-start', justifyContent: "flex-start", alignItems: 'center', alignSelf: 'center' }}> */}
              {/* <Text style={{ fontSize: heightPercentageToDP("2%"), color: 'lightgrey', fontWeight: '100', marginTop: 10 }}>Please enter the OTP </Text> */}

              <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 70 }}>
                <Text style={{ fontSize: heightPercentageToDP("1.5%"), color: 'balck', fontFamily: 'Roboto-Regular', fontWeight: '100', marginTop: 10, textAlign: 'center' }}>An OTP has been sent to your registered mobile number. </Text>
                <Text style={{ fontSize: heightPercentageToDP("1.5%"), color: 'balck', fontFamily: 'Roboto-Regular', fontWeight: '100', marginTop: 10, textAlign: 'center' }}>Please wait for OTP to auto-verify your device and Mobile number. </Text>
                <OtpInputs
                  inputStyles={{ color: LIGHTGREY, textAlign: 'center', fontSize: 20 }}
                  style={{ flexDirection: 'row', marginBottom: 10, color: LIGHTGREY, }}
                  handleChange={otp => this.setState({ otp })}
                  numberOfInputs={4}
                  value={[this.state.otp]}
                  focusStyles={{ borderColor: GREEN }}
                  editable={true}
                  inputContainerStyles={{ borderColor: BG_COLOR, borderWidth: .8, margin: 15, borderRadius: 5, width: widthPercentageToDP("15%"), height: widthPercentageToDP("15%"), backgroundColor: WHITE, justifyContent: 'center', alignItems: 'center', }}
                />
              </View>

              <View style={{ justifyContent: 'center', alignItems: 'center', margin: heightPercentageToDP(3), }} >
                {this.state.timer === 1 ? null : <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <Text style={{ color: 'black', }} >Verifying your SMS </Text>
                  <ActivityIndicator size="small" color={BG_COLOR} />
                </View>}
                {this.state.timer === 1 ? <Text onPress={this.reSendOTP} style={{ color: BG_COLOR, }}>Resend OTP <MaterialCommunityIcons name="refresh" size={20} style={{ top: 5 }} /></Text> : <Text style={{ color: BG_COLOR, }} >0:{this.state.timer}</Text>}
              </View>

              {/* <TouchableHighlight onPress={this.verifyUser} style={{ width: WIDTH - 40, height: heightPercentageToDP("8%"), justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 5, overflow: 'hidden', alignSelf: 'center' }}>
                <LinearGradient colors={[BG_COLOR, BG_COLOR]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', }} >
                  <Text numberOfLines={2} style={{ color: YELLOW, fontSize: 18, margin: 10, }}>
                    Verify
                  </Text>
                </LinearGradient>
              </TouchableHighlight> */}
            </View>

          </KeyboardAvoidingView>
          <AwesomeAlert
            show={this.state.showLoginError}
            showProgress={false}
            title={this.state.errormessage}
            message={``}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={false}
            showConfirmButton={true}
            confirmText={"Try Again"}
            onConfirmPressed={() => {
              this.setState({ showLoginError: false })
            }}
            onDismiss={() => {
              this.setState({ showLoginError: false })
            }}
          />
          {/* </ImageBackground> */}
        </Layout>
      </ApplicationProvider>
    )
  }
}
