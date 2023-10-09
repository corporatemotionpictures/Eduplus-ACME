// import React, { Component } from 'react';
// import { View, TextInput, Platform, ImageBackground, Image, SafeAreaView, TouchableHighlight, KeyboardAvoidingView, AsyncStorage, Alert, TouchableOpacity, Modal, ScrollView, StatusBar, Keyboard } from 'react-native';
// import { ApplicationProvider, Layout, Input, Button, } from "@ui-kitten/components"
// import { mapping, dark as darkTheme } from '@eva-design/eva';
// import WebView from "react-native-webview"
// import { AntDesign, Ionicons, FontAwesome } from "@expo/vector-icons"
// import { HEIGHT, WIDTH, GREEN, GREY, Header, styles, LIGHT_BLUE, BLUE, BLUE_UP, GRAD1, GRAD2, SECONDARY_COLOR, NEW_GRAD1, NEW_GRAD2, WHITE, BLACK, RedMunsell, BG_COLOR } from '../utils/utils';
// import { BASE_URL, BASE_URL_LOGIN, CLIENT_ID, FACEBOOK_CLIENT_ID, GOOGLE_CLIENT_ID, checkUserAuth, raiseTicketWithoutLogin } from '../utils/configs';
// import { LinearGradient } from "expo-linear-gradient"
// import LottieView from "lottie-react-native";
// import AwesomeAlert from 'react-native-awesome-alerts';
// import Loader from '../utils/Loader';
// import DeivceInfo, { getDeviceId, getUniqueId, getSystemName, getDeviceName, getModel, getSerialNumberSync, getSerialNumber, getBrand } from "react-native-device-info";
// import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
// import Video from 'react-native-video';
// import { Text, Block } from "expo-ui-kit"


// export default class Login extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       email: '',
//       showTerms: false,
//       uri: '',
//       loading: false,
//       showLogin: false,
//       showRaiseTicket: false,
//       city: '',
//       mobile_number: '',
//       password: '',
//       name: '',
//       message: '',
//       showLoginAlert: false,
//       user_name: '',
//       showErrorAlert: false,
//       value: "PASSWORD",
//       isVisible: true,
//       termsLoading: false,
//       addtoloading: false,
//       errorMessage: '',
//       deviceID: getUniqueId(),
//     };
//   }


//   showTermsModal = (key) => {
//     if (key == 'terms') {
//       this.setState({
//         showTerms: !this.state.showTerms,
//         uri: "https://igate.guru/terms-of-use"
//       })
//     } else {
//       this.setState({
//         showTerms: !this.state.showTerms,
//         uri: "https://igate.guru/terms-of-use"
//       })
//     }
//   }

//   componentWillMount() {
//     const id = DeivceInfo.getUniqueId()
//     this.setState({
//       deviceID: id
//     })
//     console.log("DEVICE ID LOGIN " + this.state.deviceID)
//     this.appLogin();
//   }

//   componentWillUnmount() {
//     this.props.navigation.navigate("Splash");
//   }

//   appLogin = async () => {
//     await fetch(`${BASE_URL}/api/v1/settings/appLogin`, {
//       method: "GET",
//       headers: {}
//     })
//       .then(response => response.json())
//       .then((response) => {
//         console.log(response.value)
//         if (response.value == "PASSWORD") {
//           this.setState((state) => ({
//             isVisible: state.isVisible,
//           }));
//           console.log("PASSWORD MATCH")
//         } else if (response.value == "OTP") {
//           this.setState((state) => ({
//             isVisible: !state.isVisible,
//           }));
//           console.log("OTP MATCH")
//         }

//       })
//       .catch(err => {
//         //console.error(err);
//       });
//   }

//   signIn = async () => {
//     if (this.state.mobile_number.length == 0) {
//       Alert.alert("Mobile no. is required")
//       return;
//     }
//     if (this.state.password.length == 0) {
//       Alert.alert("Password is required")
//       return;
//     }
//     this.setState({
//       loading: true
//     })
//     await fetch(`${BASE_URL}/api/v1/auth/login`, {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         mobile_number: this.state.mobile_number,
//         password: this.state.password,
//         uuid: this.state.deviceID,
//         //uuid:"0a8b26412d8d2d13"
//       }),
//     })
//       .then((res) => res.json())
//       .then((res) => {
//         console.log(res)
//         if (res.success) {
//           if (res.token != null) {
//             AsyncStorage.setItem("user_token", res.token)
//             AsyncStorage.setItem("ots_token", res.OtsAccessToken)
//             AsyncStorage.setItem("user_name", res.user.first_name)
//             AsyncStorage.setItem("user_email", res.user.email)
//             AsyncStorage.setItem("user_id", res.user.id.toString()).then(() => {
//               this.props.navigation.navigate("Main")
//             });
//             return;
//           }
//           this.setState({
//             loading: false,
//             user_name: res.user.first_name
//           });

//           // when user login with mobile and password otp not required OR when user login with mobile otp is required
//           // if(this.state.value == "PASSWORD") {
//           //   console.log("OTP is not required")
//           // } else if (this.state.value == "OTP") {
//           //   this.props.navigation.navigate("OTP", { user_id: res.user.id, user_name: res.user.first_name })
//           // }
//           this.props.navigation.navigate("OTP", { user_id: res.user.id, user_name: res.user.first_name })
//         } else if (res.success == false) {
//           this.setState({
//             loading: false,
//             showErrorAlert: true,
//             errorMessage: res.error,
//           })
//         } else {
//           this.setState({
//             loading: false,
//             showErrorAlert: true,
//           })
//         }
//       }).catch((err) => {
//         //console.log(err);
//         this.setState({
//           loading: false,
//           showErrorAlert: true,
//         })
//       });
//   }
//   //0a8b26412d8d2d13

//   handleShowLogin = () => {
//     this.setState({
//       showLogin: true
//     })
//     setTimeout(() => {
//       this.phoneRef.focus()
//     }, 1000)
//   }

//   handleCloseLogin = () => {
//     this.setState({
//       showLogin: false
//     })
//   }

//   confirmLogin = () => {
//     // this.setState({showLoginAlert:false})
//     // this.props.navigation.navigate("OTP")
//   }

//   showRaiseTicketModal = () => {
//     this.setState({
//       showRaiseTicket: true
//     })
//   }

//   submitTicket = () => {
//     this.setState({
//       loading: true
//     })
//     const ticket = {
//       city: this.state.city,
//       mobile_number: this.state.mobile_number,
//       name: this.state.name,
//       message: this.state.message
//     }
//     raiseTicketWithoutLogin(ticket).then(data => {
//       if (data.success) {
//         console.log(data);
//         Alert.alert("Raise Ticket Successfull.")
//         this.setState({
//           loading: false
//         })
//       } else {
//         this.setState({
//           loading: false
//         })
//       }
//     });
//   }

//   render() {
//     return this.state.loading ? <Loader /> : (
//       // <ScrollView>
//       <ScrollView>
//         <ApplicationProvider
//           mapping={mapping}
//           theme={darkTheme}>
//           {/* <ScrollView style={{height:  HEIGHT,}}> */}
//           <Layout style={{ flex: 1, height: HEIGHT, backgroundColor: BG_COLOR }}>
//             <LinearGradient colors={[BG_COLOR, BG_COLOR]}>
//               <StatusBar translucent={true} backgroundColor={'transparent'} />
//             </LinearGradient>

//             {/* <Block padding={heightPercentageToDP(2)} marginTop={heightPercentageToDP(4)} backgroundColor={BG_COLOR}>
//               <Text h2 color={WHITE}>Sign-in to your account</Text>
//             </Block> */}

//             <Video source={require("../../assets/login-bg.mp4")}
//               style={{
//                 width: WIDTH, height: '100%',
//                 position: 'absolute',
//               }}
//               repeat
//               resizeMode="cover"
//             />

//             <Image source={require("../../assets/Logo-light-mono.png")} style={{ height: 120, width: 150, resizeMode: 'contain', position: "absolute", top: 5, left: 25, right: 0 }} />
//             {/* <Image source={require("../../assets/Logo-min-white.png")}
//               style={{ width: 220, resizeMode: 'contain', height: 70, alignSelf: 'center', marginTop:heightPercentageToDP(15) }} />     */}
//             <KeyboardAvoidingView style={{ flex: 3 }} >
//               {/* <ImageBackground source={require("../../assets/Background.jpg")} style={{ flex: 1, backgroundColor: BLUE, height: "100%", width: "100%", }}> */}
//               <View style={{ height: HEIGHT, backgroundColor: WHITE, borderTopLeftRadius: 20, borderTopRightRadius: 30, marginTop: heightPercentageToDP(40) }}>
//                 <View style={{ height: hp("30%"), position: 'absolute', top: hp("4%"), alignItems: 'flex-start', justifyContent: "flex-start", alignItems: 'center', alignSelf: 'center' }}>
//                   {/* <Text style={{ fontFamily:'Roboto-Regular', fontSize: hp("2%"), color: 'white', marginTop: heightPercentageToDP(1), fontWeight: '100', marginLeft: 10 }}>Sign in to continue</Text> */}

//                   {/* <Image
//                     source={require("../../assets/login.png")}
//                     style={{ width: wp(50), height: heightPercentageToDP(30) }}
//                   /> */}


//                   {/* <Image source={require("../../assets/Logo-min.png")}
//                     style={{ width: 220, resizeMode: 'contain', height: 70, alignSelf: 'center', marginBottom: 0 }} /> */}

//                   <View style={{
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     backgroundColor: '#fff',
//                     borderBottomWidth: 1,
//                     borderColor: GREY,
//                     height: 55,
//                     borderRadius: 5,
//                     top: 10,
//                   }}>
//                     <AntDesign name="user" size={20} color={BG_COLOR} />
//                     <TextInput
//                       ref={ref => this.phoneRef = ref}
//                       value={this.state.mobile_number}
//                       //defaultValue="070319942536"
//                       style={{ fontFamily: 'Roboto-Regular', justifyContent: 'center', width: WIDTH - 80, height: hp("10%"), fontSize: hp('2%') }}
//                       placeholder="Enter Registered Mobile Number"
//                       underlineColorAndroid="transparent"
//                       keyboardType="number-pad"
//                       onChangeText={(mobile_number) => this.setState({ mobile_number })}
//                     />

//                   </View>

//                   {this.state.isVisible ? (
//                     <View style={{
//                       flexDirection: 'row',
//                       alignItems: 'center',
//                       backgroundColor: '#fff',
//                       borderBottomWidth: 1,
//                       borderColor: GREY,
//                       height: 55,
//                       borderRadius: 5,
//                       top: 10,
//                       marginTop: 20
//                     }}>
//                       <AntDesign name="lock1" size={22} color={BG_COLOR} />
//                       <TextInput
//                         ref={ref => this.phoneRef = ref}
//                         style={{ fontFamily: 'Roboto-Regular', justifyContent: 'center', width: WIDTH - 80, height: hp("10%"), fontSize: hp('2%'), }}
//                         placeholder="Enter Password"
//                         value={this.state.password}
//                         //defaultValue="123456"
//                         underlineColorAndroid="transparent"
//                         secureTextEntry={true}
//                         onChangeText={(password) => this.setState({ password })}
//                       />
//                     </View>
//                   ) : null}

//                   <TouchableHighlight onPress={this.signIn} style={{ backgroundColor: BLUE, width: WIDTH - 30, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, overflow: 'hidden', marginTop: heightPercentageToDP(5) }}>
//                     <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', }} >
//                       <Text numberOfLines={2} style={{ color: 'white', fontSize: 18, margin: 10, }}>
//                         LOG IN
//                       </Text>
//                     </LinearGradient>
//                   </TouchableHighlight>

//                   <View style={{ marginTop: heightPercentageToDP(2), marginBottom: heightPercentageToDP(2) }}>
//                     <Text style={{ alignSelf: 'center' }}>OR</Text>
//                   </View>

//                   {/* <TouchableOpacity onPress={() => this.props.navigation.navigate("SignUp")}>
//                     <View style={{ height: heightPercentageToDP(6), width: heightPercentageToDP(45), borderRadius: 5, marginTop: heightPercentageToDP(0), borderWidth: 1, borderColor: BG_COLOR, backgroundColor: WHITE }}>
//                       <Text style={{ color: BG_COLOR, fontSize: 16, alignItems: 'center', textAlign: 'center', marginTop: heightPercentageToDP(2), fontWeight: 'bold' }}>Create an Account</Text>
//                     </View>
//                   </TouchableOpacity> */}
//                   <TouchableHighlight onPress={() => this.props.navigation.navigate("SignUp")} style={{ width: WIDTH - 30, height: 50, justifyContent: 'center', borderWidth: 1, alignItems: 'center', borderColor: BG_COLOR, backgroundColor: WHITE, borderRadius: 8, overflow: 'hidden', marginTop: heightPercentageToDP(-1) }}>
//                     <LinearGradient onPress={() => this.props.navigation.navigate("SignUp")} colors={[WHITE, WHITE]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', }} >
//                       <Text onPress={() => this.props.navigation.navigate("SignUp")} numberOfLines={1} style={{ color: BG_COLOR, fontSize: 18, margin: 10, }}>
//                         CREATE AN ACCOUNT
//                       </Text>
//                     </LinearGradient>
//                   </TouchableHighlight>
//                   {/* <TouchableHighlight onPress={() => this.props.navigation.navigate("SignUp")} style={{marginTop:50, height: 20, width: WIDTH, margin: 30, justifyContent: 'center', alignItems: 'center', }}><Text style={{ fontSize: 15, color: 'black', fontWeight: '100', fontFamily: 'Roboto-Regular', }}>Already have an account? Sign in</Text></TouchableHighlight> */}

//                   <View style={{ alignItems: 'center', marginLeft: -10, marginTop: 10, alignSelf: 'center', }}>
//                     <View style={{ alignItems: 'center', width: WIDTH, flex: 1, height: hp("10%"), padding: 10, }}>
//                       <View style={{ width: WIDTH, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: hp(0), }}>
//                         <TouchableOpacity onPress={() => this.showTermsModal("terms")}>
//                           <Text style={{ fontSize: hp("1.5%"), color: 'grey', fontFamily: 'Roboto-Regular', textAlign: 'center', }}>Terms of Use  </Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={() => this.showTermsModal("policy")}>
//                           {/* <Text style={{ fontSize: hp("1.5%"), color: "white", }}>|</Text> */}
//                           <Text onPress={() => this.showTermsModal('policy')} style={{ fontSize: hp("1.5%"), color: 'grey', fontFamily: 'Roboto-Regular', textAlign: 'center' }}>Privacy Policy</Text>
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   </View>

//                 </View>

//                 <Modal animated visible={this.state.showTerms} presentationStyle="fullScreen" onDismiss={() => this.setState({ showTerms: false })} onRequestClose={() => this.setState({ showTerms: false })}>
//                   <View style={styles.BG_STYLE}>
//                     <Header backIcon={true} title={this.state.uri.includes('privacy') ? "Privacy Policy" : "Terms of Use"} onbackIconPress={() => this.setState({ showTerms: false })} />
//                     <WebView
//                       style={{ flex: 1 }}
//                       source={{ uri: this.state.uri }}
//                     />
//                   </View>
//                 </Modal>
//                 <Modal visible={this.state.showRaiseTicket} animated presentationStyle="fullScreen" onDismiss={() => this.setState({ showRaiseTicket: false })} onRequestClose={() => this.setState({ showRaiseTicket: false })} >
//                   <View style={{ backgroundColor: "white", flex: 1 }}>
//                     <Header backIcon={true} title={"Raise Ticket"} onbackIconPress={() => this.setState({ showRaiseTicket: false })} />
//                     <View style={{
//                       backgroundColor: BLUE,
//                       height: 150,
//                       width: WIDTH
//                     }}>
//                       <View style={{
//                         flexDirection: 'row',
//                         margin: 10,
//                         alignItems: 'center',
//                         width: WIDTH,
//                       }}>
//                         <Text style={{ fontSize: 30, fontWeight: '200', color: "white", fontFamily: 'Roboto-Bold' }}>
//                           We are here{"\n"}to help you.</Text>
//                         <LottieView
//                           autoPlay
//                           source={require("../utils/RaiseTicketAnimation.json")}
//                           style={{ height: 150, width: 150 }}
//                         />
//                       </View>
//                     </View>
//                     <View style={{ flex: 1, alignItems: 'center' }}>
//                       <Input
//                         ref={ref => this.phoneRef = ref}
//                         keyboardType="email-address"
//                         style={{ width: WIDTH - 40, textAlign: 'center', marginTop: 10, backgroundColor: "white", height: Platform.OS == 'ios' ? 45 : 45, color: 'black' }}
//                         placeholder='Full name'
//                         size="small"
//                         placeholderTextColor="grey"
//                         onChangeText={(name) => this.setState({ name })}
//                       />
//                       <Input
//                         ref={ref => this.phoneRef = ref}
//                         keyboardType="number-pad"
//                         style={{ width: WIDTH - 40, textAlign: 'center', marginTop: 10, backgroundColor: "white", color: "black", height: Platform.OS == 'ios' ? 45 : 45, }}
//                         placeholder='Mobile no.'
//                         size="small"
//                         placeholderTextColor="grey"
//                         onChangeText={(mobile_number) => this.setState({ mobile_number })}
//                       />
//                       <Input
//                         ref={ref => this.phoneRef = ref}
//                         keyboardType="default"
//                         style={{ width: WIDTH - 40, textAlign: 'center', marginTop: 10, backgroundColor: "white", color: "black", height: Platform.OS == 'ios' ? 45 : 45, }}
//                         placeholder='City'
//                         size="small"
//                         placeholderTextColor="grey"
//                         onChangeText={(city) => this.setState({ city })}
//                       />
//                       <Input
//                         multiline
//                         ref={ref => this.phoneRef = ref}
//                         keyboardType="default"
//                         numberOfLines={5}
//                         style={{ width: WIDTH - 40, textAlign: 'center', marginTop: 10, backgroundColor: "white", color: "black", height: 100, }}
//                         placeholder='Messages'
//                         placeholderTextColor="grey"
//                         onChangeText={(message) => this.setState({ message })}
//                       />
//                       <TouchableHighlight onPress={this.submitTicket} style={{ backgroundColor: '#669900', width: WIDTH - 40, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 15, overflow: 'hidden' }}>
//                         <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', }} >
//                           <Text numberOfLines={2} style={{ fontFamily: 'Roboto-Regular', color: 'white', fontSize: 18, margin: 10, }}>
//                             SUBMIT
//                           </Text>
//                         </LinearGradient>
//                       </TouchableHighlight>
//                     </View>
//                   </View>
//                 </Modal>
//                 {/* </ImageBackground> */}
//               </View>
//               <AwesomeAlert
//                 show={this.state.showLoginAlert}
//                 showProgress={false}
//                 title="Login Successful"
//                 message={` Hello,${this.state.user_name}`}
//                 closeOnTouchOutside={true}
//                 closeOnHardwareBackPress={false}
//                 showCancelButton={false}
//                 showConfirmButton={true}
//                 confirmButtonColor={BLUE}
//                 onConfirmPressed={() => {
//                   this.confirmLogin()
//                 }}
//               />
//               <AwesomeAlert
//                 show={this.state.showErrorAlert}
//                 showProgress={false}
//                 //title="This is not the registered mobile number."
//                 message={this.state.errorMessage}
//                 closeOnTouchOutside={true}
//                 closeOnHardwareBackPress={false}
//                 showCancelButton={false}
//                 showConfirmButton={true}
//                 confirmButtonColor={BLUE}
//                 onConfirmPressed={() => {
//                   this.setState({
//                     showErrorAlert: false
//                   })
//                 }}
//                 onDismiss={() => {
//                   this.setState({
//                     showErrorAlert: false
//                   })
//                 }}
//                 confirmText="Try Again"
//               />
//             </KeyboardAvoidingView>

//           </Layout>
//           {/* </ScrollView> */}
//         </ApplicationProvider>
//       </ScrollView>

//     );
//   }
// }

import React, { Component } from 'react';
import { View, TextInput, Platform, ImageBackground, Image, SafeAreaView, TouchableHighlight, KeyboardAvoidingView, AsyncStorage, Alert, TouchableOpacity, Modal, ScrollView, StatusBar, Keyboard, ActivityIndicator } from 'react-native';
import { ApplicationProvider, Layout, Input, Button, } from "@ui-kitten/components"
import { mapping, dark as darkTheme } from '@eva-design/eva';
import WebView from "react-native-webview"
import { AntDesign, Ionicons, FontAwesome } from "@expo/vector-icons"
import { HEIGHT, WIDTH, GREEN, GREY, Header, styles, LIGHT_BLUE, BLUE, BLUE_UP, GRAD1, GRAD2, SECONDARY_COLOR, NEW_GRAD1, NEW_GRAD2, WHITE, BLACK, RedMunsell, BG_COLOR, YELLOW, PINK } from '../utils/utils';
import { BASE_URL, BASE_URL_LOGIN, CLIENT_ID, FACEBOOK_CLIENT_ID, GOOGLE_CLIENT_ID, checkUserAuth, raiseTicketWithoutLogin } from '../utils/configs';
import { LinearGradient } from "expo-linear-gradient"
import LottieView from "lottie-react-native";
import AwesomeAlert from 'react-native-awesome-alerts';
import Loader from '../utils/Loader';
import DeivceInfo, { getDeviceId, getUniqueId, getSystemName, getDeviceName, getModel, getSerialNumberSync, getSerialNumber, getBrand } from "react-native-device-info";
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import Video from 'react-native-video';
import { Text, Block } from "expo-ui-kit"


export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      showTerms: false,
      uri: '',
      loading: false,
      showLogin: false,
      showRaiseTicket: false,
      city: '',
      mobile_number: '',
      password: '',
      name: '',
      message: '',
      showLoginAlert: false,
      user_name: '',
      showErrorAlert: false,
      value: "PASSWORD",
      isVisible: true,
      termsLoading: false,
      addtoloading: false,
      errorMessage: '',
      createAccount: false,
      deviceID: getUniqueId(),
    };
  }


  showTermsModal = (key) => {
    if (key == 'terms') {
      this.setState({
        showTerms: !this.state.showTerms,
        uri: `https://www.etherealcorporate.com/ethereal-terms-of-use`
      })
    } else {
      this.setState({
        showTerms: !this.state.showTerms,
        uri: `https://www.etherealcorporate.com/ethereal-privacy-policy`
      })
    }
  }

  async componentDidMount() {
    this.didFocusListner = this.props.navigation.addListener(
      'didFocus',
      () => {
        this.setState({ createAccount: false })
      }
    )
  }

  componentWillUnmount() {
    this.didFocusListener.remove();
  }

  componentWillMount() {
    const id = DeivceInfo.getUniqueId()
    this.setState({
      deviceID: id
    })
    console.log("DEVICE ID LOGIN " + this.state.deviceID)
    this.appLogin();
  }

  componentWillUnmount() {
    this.props.navigation.navigate("Splash");
  }

  appLogin = async () => {
    await fetch(`${BASE_URL}/api/v1/settings/appLogin`, {
      method: "GET",
      headers: {}
    })
      .then(response => response.json())
      .then((response) => {
        console.log(response.value)
        if (response.value == "PASSWORD") {
          this.setState((state) => ({
            isVisible: state.isVisible,
          }));
          console.log("PASSWORD MATCH")
        } else if (response.value == "OTP") {
          this.setState((state) => ({
            isVisible: !state.isVisible,
          }));
          console.log("OTP MATCH")
        }

      })
      .catch(err => {
        //console.error(err);
      });
  }

  signIn = async () => {
    if (this.state.mobile_number.length == 0) {
      Alert.alert("Mobile no. is required")
      return;
    }
    if (this.state.password.length == 0) {
      Alert.alert("Password is required")
      return;
    }
    this.setState({
      loading: true
    })
    await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile_number: this.state.mobile_number,
        password: this.state.password,
        uuid: this.state.deviceID,
        //uuid:"0a8b26412d8d2d13"
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
        if (res.success) {
          if (res.token != null) {
            AsyncStorage.setItem("user_token", res.token)
            AsyncStorage.setItem("ots_token", res.OtsAccessToken)
            AsyncStorage.setItem("user_name", res.user.first_name)
            AsyncStorage.setItem("user_email", res.user.email)
            AsyncStorage.setItem("user_id", res.user.id.toString()).then(() => {
              this.props.navigation.navigate("Main")
            });
            return;
          }
          this.setState({
            loading: false,
            user_name: res.user.first_name
          });

          // when user login with mobile and password otp not required OR when user login with mobile otp is required
          // if(this.state.value == "PASSWORD") {
          //   console.log("OTP is not required")
          // } else if (this.state.value == "OTP") {
          //   this.props.navigation.navigate("OTP", { user_id: res.user.id, user_name: res.user.first_name })
          // }
          this.props.navigation.navigate("OTP", { user_id: res.user.id, user_name: res.user.first_name })
        } else if (res.success == false) {
          this.setState({
            loading: false,
            showErrorAlert: true,
            errorMessage: res.error,
          })
        } else {
          this.setState({
            loading: false,
            showErrorAlert: true,
          })
        }
      }).catch((err) => {
        //console.log(err);
        this.setState({
          loading: false,
          showErrorAlert: true,
        })
      });
  }
  //0a8b26412d8d2d13

  handleShowLogin = () => {
    this.setState({
      showLogin: true
    })
    setTimeout(() => {
      this.phoneRef.focus()
    }, 1000)
  }

  handleCloseLogin = () => {
    this.setState({
      showLogin: false
    })
  }

  confirmLogin = () => {
    // this.setState({showLoginAlert:false})
    // this.props.navigation.navigate("OTP")
  }

  showRaiseTicketModal = () => {
    this.setState({
      showRaiseTicket: true
    })
  }

  submitTicket = () => {
    this.setState({
      loading: true
    })
    const ticket = {
      city: this.state.city,
      mobile_number: this.state.mobile_number,
      name: this.state.name,
      message: this.state.message
    }
    raiseTicketWithoutLogin(ticket).then(data => {
      if (data.success) {
        console.log(data);
        Alert.alert("Raise Ticket Successfull.")
        this.setState({
          loading: false
        })
      } else {
        this.setState({
          loading: false
        })
      }
    });
  }

  handleSignup = () => {
    if (this.state.createAccount == false) {
      this.setState({
        createAccount: true
      })
      setTimeout(() => { this.props.navigation.navigate("SignUp") }, 100)
    } else {
      this.setState({
        createAccount: false
      })
    }
  }

  render() {
    return this.state.loading ? <Loader /> : (
      // <ScrollView>
      <ScrollView>
        <ApplicationProvider
          mapping={mapping}
          theme={darkTheme}>
          {/* <ScrollView style={{height:  HEIGHT,}}> */}
          <Layout style={{ flex: 1, height: HEIGHT, backgroundColor: BG_COLOR }}>
            <StatusBar translucent={true} backgroundColor={'transparent'} />

            {/* <Block padding={heightPercentageToDP(2)} marginTop={heightPercentageToDP(4)} backgroundColor={BG_COLOR}>
            <Text h2 color={WHITE}>Sign-in to your account</Text>
          </Block> */}

            <Video source={require("../../assets/login-bg.mp4")}
              style={{
                width: WIDTH, height: '50%',
                opacity: .7,
                position: 'absolute',
              }}
              repeat
              resizeMode="cover"
            />
            {/* <Image source={{ uri: `${BASE_URL}/cdn/splash/splash-screen.png` }} style={{ height: (HEIGHT / 2) + 100, width: WIDTH, position: "absolute", top: heightPercentageToDP(-2), left: 0, right: 0, resizeMode: 'cover' }} /> */}
            <Block middle style={{ justifyContent: 'center', alignItems: "center" }}>

              <Image source={require("../../assets/Logo-light.png")} style={{ height: 200, width: 240, resizeMode: 'contain' }} />

            </Block>
            {/* <Image source={require("../../assets/Logo-min-white.png")}
            style={{ width: 220, resizeMode: 'contain', height: 70, alignSelf: 'center', marginTop:heightPercentageToDP(15) }} />     */}


            <KeyboardAvoidingView style={{ flex: 2 }} >
              {/* <ImageBackground source={require("../../assets/Background.jpg")} style={{ flex: 1, backgroundColor: BLUE, height: "100%", width: "100%", }}> */}
              <View style={{ height: HEIGHT, backgroundColor: WHITE, borderTopLeftRadius: 20, borderTopRightRadius: 30 }}>
                <View style={{ height: hp("30%"), position: 'absolute', top: hp("4%"), alignItems: 'flex-start', justifyContent: "flex-start", alignItems: 'center', alignSelf: 'center' }}>
                  {/* <Text style={{ fontFamily:'Roboto-Regular', fontSize: hp("2%"), color: 'white', marginTop: heightPercentageToDP(1), fontWeight: '100', marginLeft: 10 }}>Sign in to continue</Text> */}

                  {/* <Image
                  source={require("../../assets/login.png")}
                  style={{ width: wp(50), height: heightPercentageToDP(30) }}
                /> */}
                  {/* <Image source={require("../../assets/Logo-min.png")}
                  style={{ width: 220, resizeMode: 'contain', height: 70, alignSelf: 'center', marginBottom: 0 }} /> */}

                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderBottomWidth: .7,
                    borderColor: BG_COLOR,
                    height: 55,
                    borderRadius: 5,
                    top: 10,
                  }}>
                    <AntDesign name="user" size={20} color={BG_COLOR} />
                    <TextInput
                      ref={ref => this.phoneRef = ref}
                      value={this.state.mobile_number}
                      //defaultValue="070319942536"
                      style={{ fontFamily: 'Roboto-Regular', justifyContent: 'center', width: WIDTH - 80, height: hp("10%"), fontSize: 16 }}
                      placeholder="Enter Registered Mobile Number"
                      underlineColorAndroid="transparent"
                      keyboardType="number-pad"
                      onChangeText={(mobile_number) => this.setState({ mobile_number })}
                    />

                  </View>

                  {this.state.isVisible ? (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#fff',
                      borderBottomWidth: .7,
                      borderColor: BG_COLOR,
                      height: 55,
                      borderRadius: 5,
                      top: 10,
                      marginTop: 20
                    }}>
                      <AntDesign name="lock1" size={22} color={BG_COLOR} />
                      <TextInput
                        ref={ref => this.phoneRef = ref}
                        style={{ fontFamily: 'Roboto-Regular', justifyContent: 'center', width: WIDTH - 80, height: hp("10%"), fontSize: 16, }}
                        placeholder="Enter Password"
                        value={this.state.password}
                        //defaultValue="123456"
                        underlineColorAndroid="transparent"
                        secureTextEntry={true}
                        onChangeText={(password) => this.setState({ password })}
                      />
                    </View>
                  ) : null}

                  <TouchableHighlight onPress={this.signIn} style={{ backgroundColor: BLUE, width: WIDTH - 30, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, overflow: 'hidden', marginTop: heightPercentageToDP(5) }}>
                    <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', }} >
                      <Text numberOfLines={2} style={{ color: WHITE, fontSize: 18, margin: 10, fontWeight: 'bold' }}>
                        LOG IN
                      </Text>
                    </LinearGradient>
                  </TouchableHighlight>

                  <View style={{ marginTop: heightPercentageToDP(2), marginBottom: heightPercentageToDP(2) }}>
                    <Text style={{ alignSelf: 'center' }}>OR</Text>
                  </View>

                  {/* <TouchableOpacity onPress={() => this.props.navigation.navigate("SignUp")}>
                  <View style={{ height: heightPercentageToDP(6), width: heightPercentageToDP(45), borderRadius: 5, marginTop: heightPercentageToDP(0), borderWidth: 1, borderColor: BG_COLOR, backgroundColor: WHITE }}>
                    <Text style={{ color: BG_COLOR, fontSize: 16, alignItems: 'center', textAlign: 'center', marginTop: heightPercentageToDP(2), fontWeight: 'bold' }}>
                    </Text>
                  </View>
                </TouchableOpacity> */}

                  <TouchableOpacity onPress={this.handleSignup} style={{ width: WIDTH - 30, height: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BG_COLOR, backgroundColor: WHITE, borderRadius: 8, overflow: 'hidden', marginTop: heightPercentageToDP(-1) }} activeOpacity={.2}>
                    <LinearGradient colors={[WHITE, WHITE]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }} >
                      {this.state.createAccount == true ? (
                        <View style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                          <ActivityIndicator size="small" color="#ffc907" />
                        </View>
                      ) : (
                        <Text numberOfLines={1} style={{ color: BG_COLOR, fontSize: 18, margin: 10 }}>
                          CREATE AN ACCOUNT
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* <TouchableHighlight onPress={() => this.props.navigation.navigate("SignUp")} style={{marginTop:50, height: 20, width: WIDTH, margin: 30, justifyContent: 'center', alignItems: 'center', }}><Text style={{ fontSize: 15, color: 'black', fontWeight: '100', fontFamily: 'Roboto-Regular', }}>Already have an account? Sign in</Text></TouchableHighlight> */}

                  <View style={{ alignItems: 'center', marginLeft: -10, marginTop: 10, alignSelf: 'center', }}>
                    <View style={{ alignItems: 'center', width: WIDTH, flex: 1, height: hp("10%"), padding: 10, }}>
                      <View style={{ width: WIDTH, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: hp(0), }}>
                        <TouchableOpacity onPress={() => this.showTermsModal("terms")}>
                          <Text style={{ fontSize: hp("1.5%"), color: 'grey', fontFamily: 'Roboto-Regular', textAlign: 'center', }}>Terms of Use</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.showTermsModal("policy")} style={{ marginLeft: 10 }}>
                          {/* <Text style={{ fontSize: hp("1.5%"), color: "white", }}>|</Text> */}
                          <Text onPress={() => this.showTermsModal('policy')} style={{ fontSize: hp("1.5%"), color: 'grey', fontFamily: 'Roboto-Regular', textAlign: 'center' }}>Privacy Policy</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                </View>

                <Modal animated visible={this.state.showTerms} presentationStyle="fullScreen" onDismiss={() => this.setState({ showTerms: false })} onRequestClose={() => this.setState({ showTerms: false })}>
                  <StatusBar translucent={true} backgroundColor={"transparent"} />
                  <View style={styles.BG_STYLE}>
                    <View style={{ width: widthPercentageToDP(100), backgroundColor: BG_COLOR, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                      <Ionicons onPress={() => this.setState({ showTerms: false })} name="ios-arrow-back" size={25} color={"white"} style={{ marginLeft: 14 }} />
                      <Block center>
                        <Text style={{ color: 'white', fontSize: 20, marginTop: -2 }}>{this.state.uri.includes('privacy') ? "Privacy Policy" : "Terms of Use"}</Text>
                      </Block>
                    </View>
                    <WebView
                      style={{ flex: 1 }}
                      source={{ uri: this.state.uri }}
                    />
                  </View>
                </Modal>
                <Modal visible={this.state.showRaiseTicket} animated presentationStyle="fullScreen" onDismiss={() => this.setState({ showRaiseTicket: false })} onRequestClose={() => this.setState({ showRaiseTicket: false })} >
                  <View style={{ backgroundColor: "white", flex: 1 }}>
                    <Header backIcon={true} title={"Raise Ticket"} onbackIconPress={() => this.setState({ showRaiseTicket: false })} />
                    <View style={{
                      backgroundColor: BLUE,
                      height: 150,
                      width: WIDTH
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        margin: 10,
                        alignItems: 'center',
                        width: WIDTH,
                      }}>
                        <Text style={{ fontSize: 30, fontWeight: '200', color: "white", fontFamily: 'Roboto-Bold' }}>
                          We are here{"\n"}to help you.</Text>
                        <LottieView
                          autoPlay
                          source={require("../utils/RaiseTicketAnimation.json")}
                          style={{ height: 150, width: 150 }}
                        />
                      </View>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Input
                        ref={ref => this.phoneRef = ref}
                        keyboardType="email-address"
                        style={{ width: WIDTH - 40, textAlign: 'center', marginTop: 10, backgroundColor: "white", height: Platform.OS == 'ios' ? 45 : 45, color: 'black' }}
                        placeholder='Full name'
                        size="small"
                        placeholderTextColor="grey"
                        onChangeText={(name) => this.setState({ name })}
                      />
                      <Input
                        ref={ref => this.phoneRef = ref}
                        keyboardType="number-pad"
                        style={{ width: WIDTH - 40, textAlign: 'center', marginTop: 10, backgroundColor: "white", color: "black", height: Platform.OS == 'ios' ? 45 : 45, }}
                        placeholder='Mobile no.'
                        size="small"
                        placeholderTextColor="grey"
                        onChangeText={(mobile_number) => this.setState({ mobile_number })}
                      />
                      <Input
                        ref={ref => this.phoneRef = ref}
                        keyboardType="default"
                        style={{ width: WIDTH - 40, textAlign: 'center', marginTop: 10, backgroundColor: "white", color: "black", height: Platform.OS == 'ios' ? 45 : 45, }}
                        placeholder='City'
                        size="small"
                        placeholderTextColor="grey"
                        onChangeText={(city) => this.setState({ city })}
                      />
                      <Input
                        multiline
                        ref={ref => this.phoneRef = ref}
                        keyboardType="default"
                        numberOfLines={5}
                        style={{ width: WIDTH - 40, textAlign: 'center', marginTop: 10, backgroundColor: "white", color: "black", height: 100, }}
                        placeholder='Messages'
                        placeholderTextColor="grey"
                        onChangeText={(message) => this.setState({ message })}
                      />
                      <TouchableHighlight onPress={this.submitTicket} style={{ backgroundColor: '#669900', width: WIDTH - 40, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 15, overflow: 'hidden' }}>
                        <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', }} >
                          <Text numberOfLines={2} style={{ fontFamily: 'Roboto-Regular', color: 'white', fontSize: 18, margin: 10, }}>
                            SUBMIT
                          </Text>
                        </LinearGradient>
                      </TouchableHighlight>
                    </View>
                  </View>
                </Modal>
                {/* </ImageBackground> */}
              </View>
              <AwesomeAlert
                show={this.state.showLoginAlert}
                showProgress={false}
                title="Login Successful"
                message={` Hello,${this.state.user_name}`}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                confirmButtonColor={BLUE}
                onConfirmPressed={() => {
                  this.confirmLogin()
                }}
              />
              <AwesomeAlert
                show={this.state.showErrorAlert}
                showProgress={false}
                //title="This is not the registered mobile number."
                message={this.state.errorMessage}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                confirmButtonColor={BLUE}
                onConfirmPressed={() => {
                  this.setState({
                    showErrorAlert: false
                  })
                }}
                onDismiss={() => {
                  this.setState({
                    showErrorAlert: false
                  })
                }}
                confirmText="Try Again"
              />
            </KeyboardAvoidingView>

          </Layout>
          {/* </ScrollView> */}
        </ApplicationProvider>
      </ScrollView>
    );
  }
}

