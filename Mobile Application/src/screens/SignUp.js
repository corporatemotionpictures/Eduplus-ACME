import React, { Component } from 'react';
import { View, Text, TextInput, ImageBackground, Image, TouchableOpacity, TouchableHighlight, KeyboardAvoidingView, ScrollView, Alert, Picker, StyleSheet, AsyncStorage, Dimensions } from 'react-native';
import { ApplicationProvider, Layout, Input, Button } from "@ui-kitten/components"
import { mapping, dark as darkTheme } from '@eva-design/eva';
import { BASE_URL, BASE_URL_LOGIN, fetchCourses } from '../utils/configs';
import { HEIGHT, WIDTH, GREEN, GREY, LIGHT_BLUE, NEW_GRAD1, NEW_GRAD2, LIGHTGREY, BG_COLOR, BLUE } from '../utils/utils';
import Loader from '../utils/Loader';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from 'react-native-datepicker';
import Icon from 'react-native-vector-icons/AntDesign'
import { AntDesign, Ionicons, FontAwesome, MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import moment from 'moment';
import Video from 'react-native-video';


export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      last_name: "",
      first_name: "",
      mobile_number: '',
      branch: '',
      loading: false,
      city: '',
      password: '',
      confirmpassword: '',
      selectedCourse: "",
      courses: [],
      isVisible: true,
      errorMessage: '',
      value: "OTP"
    };
  }

  componentWillMount() {
    AsyncStorage.getItem("user_token").then((token) => {
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
        //this.loadMore()
      })
      this.appLogin();
    })
  }

  appLogin = async () => {
    await fetch(`${BASE_URL}/api/v1/settings/appLogin`, {
      //await fetch("https://v2.ACME Academyacademy.com/api/v1/settings/appLogin", {
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
          //console.log("PASSWORD MATCH")
        } else if (response.value == "OTP") {
          this.setState((state) => ({
            isVisible: !state.isVisible,
          }));
          //console.log("OTP MATCH")
        }
      })
      .catch(err => {
        //console.error(err);
      });
  }


  // appLoginSetting = async () => {
  //   await fetch(`${BASE_URL_LOGIN}/api/v1/settings/appLogin`, {
  //     method: "GET",
  //     header: {}
  //   })
  //   .then(response => response.json())
  //   .then((response) => {
  //     console.log(response)
  //     if(response.value == "PASSWORD") {
  //       this.setState((state) => ({
  //         isVisible: state.isVisible,
  //       }));
  //     } else if (response.value == "OTP") {
  //       this.setState((state) => ({
  //         isVisible: !state.isVisible,
  //       }));
  //     }
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   });
  // }


  deatilsUpdate = async () => {
    if (this.state.first_name == "") {
      Alert.alert("First Name is required");
      return;
    }
    if (this.state.last_name == "") {
      Alert.alert("Last name is required");
      return;
    }
    if (this.state.email == "") {
      Alert.alert("email is required");
      return;
    }
    if (this.state.mobile_number == "") {
      Alert.alert("mobile number is required");
      return;
    }
    if (this.state.city == "") {
      Alert.alert("dob is required");
      return;
    }
    if (this.state.password == "") {
      Alert.alert("password is required");
      return;
    }
    if (this.state.confirmpassword == "") {
      Alert.alert("confirm password is required");
      return;
    }
    if (this.state.password != this.state.confirmpassword) {
      Alert.alert("password not match");
      return;
    }
    if (this.state.selectedCourse == null) {
      Alert.alert("Please select any course");
      return;
    }
    console.log(this.state.first_name)
    console.log(this.state.last_name)
    console.log(this.state.email)
    console.log(this.state.mobile_number)
    console.log(this.state.password)
    console.log(this.state.confirmpassword)
    console.log(this.state.city)
    console.log(this.state.selectedCourse.toString())
    this.setState({
      loading: true
    })
    await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email,
        mobile_number: this.state.mobile_number,
        password: this.state.password,
        confirm_password: this.state.confirmpassword,
        dob: this.state.city,
        branch: this.state.selectedCourse.toString(),
      })
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res.user)
        //console.log(res.user.data.id);
        // console.log(res.error.details)
        if (res.success) {
          this.setState({ loading: false })
          this.props.navigation.navigate("OTP", { user_id: res.user.data.id })
        }
        else if (res.success == false) {
          if (res.error == "Mobile Number Already Exist") {
            this.setState({ errorMessage: res.error })
            Alert.alert(this.state.errorMessage)
          } else {
            this.setState({ errorMessage: res.error })
            Alert.alert(this.state.errorMessage)
            this.setState({
              loading: false
            })
          }
          Alert.alert(this.state.errorMessage)
        }
      }).catch((err) => {
        //console.log(err);
        this.setState({
          loading: false,
          //showErrorAlert: true,
        })
        Alert.alert(this.state.errorMessage)
      });
  }

  static navigationOptions = {
    header: null
  }

  render() {
    return (
      // <View style={{ flex: 1, width: WIDTH, height: HEIGHT, backgroundColor: BG_COLOR }}>

      // </View>
      <ScrollView style={{ height: HEIGHT }} keyboardShouldPersistTaps='always'>
        <ApplicationProvider
          mapping={mapping}
          theme={darkTheme}
        >
          <View>
            <Video source={require("../../assets/login-bg.mp4")}
              style={{
                width: "100%", height: "100%",
                opacity: 0.5,
                backgroundColor: BG_COLOR,
                position: 'absolute',
                top: 0
              }}
              repeat
              resizeMode='cover'
            />
            {/* <Layout style={{ flex: 1, width: "100%", height: "100%", position:'relative', top:0 }}> */}

            {this.state.loading ? <Loader /> :
              <KeyboardAvoidingView style={{ width: WIDTH, alignItems: 'center', height: "100%" }} >
                <Image source={require("../../assets/Logo-light.png")} style={{ width: widthPercentageToDP(50), height: 100, resizeMode: 'contain', marginTop: 20 }} />
                {/* <Text style={{fontSize:30,color:'white',fontWeight:'bold',marginTop:10}}>Welcome</Text> */}
                <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 18, color: 'white', fontWeight: '100', marginTop: 5 }}>Sign up for your account</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderWidth: .5,
                  borderColor: '#000',
                  height: 55,
                  borderRadius: 5,
                  margin: 10,
                  marginTop: 35
                }}>
                  <AntDesign name="user" size={20} color="grey" style={{ marginLeft: 15 }} />
                  <TextInput
                    ref={ref => this.phoneRef = ref}
                    style={{ fontFamily: 'Lato-Regular', justifyContent: 'center', width: WIDTH - 80, height: hp("10%"), fontSize: 14, }}
                    placeholder="First Name"
                    underlineColorAndroid="transparent"
                    onChangeText={name => this.setState({ first_name: name })}
                  />
                </View>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderWidth: .5,
                  borderColor: '#000',
                  height: 55,
                  borderRadius: 5,
                  margin: 10,
                  marginTop: 4
                }}>
                  <AntDesign name="user" size={20} color="grey" style={{ marginLeft: 15 }} />
                  <TextInput
                    ref={ref => this.phoneRef = ref}
                    style={{ fontFamily: 'Lato-Regular', justifyContent: 'center', width: WIDTH - 80, height: hp("10%"), fontSize: 14, }}
                    placeholder="Last Name"
                    underlineColorAndroid="transparent"
                    onChangeText={name => this.setState({ last_name: name })}
                  />
                </View>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderWidth: .5,
                  borderColor: '#000',
                  height: 55,
                  borderRadius: 5,
                  margin: 10,
                  marginTop: 4
                }}>
                  <MaterialCommunityIcons name="email-outline" size={20} color="grey" style={{ marginLeft: 15 }} />
                  <TextInput
                    ref={ref => this.phoneRef = ref}
                    style={{ fontFamily: 'Lato-Regular', justifyContent: 'center', width: WIDTH - 80, height: hp("10%"), fontSize: 14, }}
                    placeholder="E-Mail"
                    keyboardType="email-address"
                    underlineColorAndroid="transparent"
                    onChangeText={name => this.setState({ email: name })}
                  />
                </View>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderWidth: .5,
                  borderColor: '#000',
                  height: 55,
                  borderRadius: 5,
                  margin: 10,
                  marginTop: 4
                }}>
                  <Feather name="smartphone" size={20} color="grey" style={{ marginLeft: 15 }} />
                  <TextInput
                    ref={ref => this.phoneRef = ref}
                    style={{ fontFamily: 'Lato-Regular', justifyContent: 'center', width: WIDTH - 80, height: hp("10%"), fontSize: 14, }}
                    placeholder="Phone Number"
                    keyboardType="number-pad"
                    underlineColorAndroid="transparent"
                    onChangeText={name => this.setState({ mobile_number: name })}
                  />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignSelf: 'center' }}>
                  {/* <Feather name="smartphone" size={20} color="grey" style={{ marginLeft: 15 }} /> */}
                  <View style={[Style.pickerWrapper, { width: widthPercentageToDP(90), height: 55, }]}>
                    <Picker
                      placeholder="Select Course"
                      placeholderStyle={{ fontFamily: 'Lato-Regular', color: "white", allowFontScaling: false, }}
                      placeholderIconColor={"white"}
                      itemStyle={{}}
                      mode="dropdown"
                      style={{}}
                      selectedValue={this.state.selectedCourse}
                      onValueChange={(itemValue, itemIndex) => {
                        this.setState({
                          selectedCourse: itemValue
                        }, () => {
                          console.log(this.state.selectedCourse)
                        })
                      }}
                    >
                      <Picker.Item label={"Select Course"} color={LIGHTGREY} value={0} />
                      {
                        this.state.courses.map((item, index) => {
                          return <Picker.Item label={item.name} color={'black'} value={item.id} />
                        })
                      }

                    </Picker>
                  </View>
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderWidth: .5,
                  borderColor: '#000',
                  height: 55,
                  borderRadius: 5,
                  margin: 10,
                  marginTop: 15,
                }}>

                  <DatePicker
                    style={{ fontFamily: 'Lato-Regular', justifyContent: 'center', textAlign: 'left', width: WIDTH - 45, height: hp("10%"), fontSize: 14, }}
                    date={this.state.city}
                    mode="date"
                    placeholder="Date Of Birth"
                    format="DD-MM-YYYY"
                    minDate="01-01-1980"
                    maxDate={moment().format("DD-MM-YYYY")}
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    iconComponent={
                      <Icon
                        size={20}
                        style={{ position: 'absolute', left: 0, top: 10, marginLeft: 15 }}
                        color='grey'
                        name='calendar'
                      />
                    }
                    customStyles={{
                      dateInput: {
                        marginLeft: 40,
                        borderWidth: 0,
                        marginTop: 12,
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        alignSelf: 'flex-start',
                        alignItems: 'flex-start',
                      },
                      placeholderText: {
                        color: 'grey',
                        fontFamily: 'Lato-Regular',
                        marginLeft: 5,
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        alignSelf: 'flex-start',
                        alignItems: 'flex-start'
                      }
                    }}
                    onDateChange={(date) => { this.setState({ city: date }) }}
                  />
                </View>

                {this.state.isVisible ? (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderWidth: .5,
                    borderColor: '#000',
                    height: 55,
                    borderRadius: 5,
                    margin: 10,
                    marginTop: 4
                  }}>
                    <AntDesign name="lock1" size={20} color="grey" style={{ marginLeft: 15 }} />
                    <TextInput
                      ref={ref => this.phoneRef = ref}
                      style={{ fontFamily: 'Lato-Regular', justifyContent: 'center', width: WIDTH - 80, height: hp("10%"), fontSize: 14, }}
                      placeholder="Create a Password"
                      secureTextEntry={true}
                      underlineColorAndroid="transparent"
                      onChangeText={name => this.setState({ password: name })}
                    />
                  </View>) : null}
                {this.state.isVisible ? (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderWidth: .5,
                    borderColor: '#000',
                    height: 55,
                    borderRadius: 5,
                    margin: 10,
                    marginTop: 4
                  }}>
                    <AntDesign name="lock1" size={20} color="grey" style={{ marginLeft: 15 }} />
                    <TextInput
                      ref={ref => this.phoneRef = ref}
                      style={{ fontFamily: 'Lato-Regular', justifyContent: 'center', width: WIDTH - 80, height: hp("10%"), fontSize: 14, }}
                      placeholder="Confirm Password"
                      secureTextEntry={true}
                      underlineColorAndroid="transparent"
                      onChangeText={name => this.setState({ confirmpassword: name })}
                    />
                  </View>) : null}
                <View style={{ justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
                  <TouchableOpacity onPress={this.deatilsUpdate}>
                    <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ height: 60, width: 60, borderRadius: 30 }}>
                      <View style={{ height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', textAlign: 'center', alignSelf: 'center', alignContent: 'center', backgroundColor: 'transparent' }}   >
                        <AntDesign name="arrowright" size={24} color="white" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <TouchableHighlight onPress={() => this.props.navigation.navigate("Login")} style={{ marginTop: 50, height: 20, width: WIDTH, margin: 30, justifyContent: 'center', alignItems: 'center', }}><Text style={{ fontSize: 15, color: 'white', fontWeight: '100', fontFamily: 'Roboto-Regular', }}>Already have an account? Sign in</Text></TouchableHighlight>
              </KeyboardAvoidingView>
            }
            {/* </Video> */}
            {/* </Layout> */}
          </View>
        </ApplicationProvider>
      </ScrollView>
    );
  }
}

const Style = StyleSheet.create({
  pickerWrapper: {
    borderColor: 'white',
    borderWidth: .9,
    backgroundColor: "white",
    borderRadius: 4,
    marginTop: 10
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