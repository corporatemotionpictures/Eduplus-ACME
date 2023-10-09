import { View, ScrollView, Text, TouchableNativeFeedback, SafeAreaView, AsyncStorage, Alert, StyleSheet, TouchableOpacity, Image } from "react-native";

import { createDrawerNavigator, DrawerNavigatorItems, Div } from "react-navigation-drawer"
import React, { Component } from "react";
import { TAB_ICON_COLOR, BG_COLOR, GREY, LIGHT_GREY, BLUE, WHITE, BLACK , BLUELIGHT, WIDTH} from "./utils";
import { Drawer } from "@ui-kitten/components";
import { Ionicons, MaterialIcons, Entypo, Octicons, FontAwesome5, Feather, AntDesign, MaterialCommunityIcons, FontAwesome, Foundation } from "@expo/vector-icons"
import { fetchUserDetails, BASE_URL } from "./configs";
import Background from "./Background";
import LottiView from "lottie-react-native"
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import Animated from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient"


export default class CustomDrawerContentComponent extends Component {

  constructor() {
    super();
    this.state = {
      userDetails: {},
      user_id: ''
    }
  }

  componentDidMount() {
    AsyncStorage.getItem("user_token").then(token => {
      AsyncStorage.getItem("user_id", (err, res) => {
        this.setState({ user_id: res })
        fetchUserDetails(res, token).then((res) => {
          if (res.success) {
            this.setState({
              userDetails: res.user,
              loading: false
            })
          } else {
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
      Alert.alert("You have successfully logged out !", "To go back in, enter your registered mobile number.")
    })
  }


  render() {
    const { first_name, last_name, image } = this.state.userDetails
    return (
      <LinearGradient colors={[ "#FFFFFF","#FFFFFF" ]}  start={{ x: 1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, backgroundColor: BG_COLOR, width: 220, overflow: 'hidden', justifyContent: 'flex-start' }}>
        {/* <Background/> */}
        <ScrollView>
          {/* <View style={{height:200,justifyContent:'center',alignItems:'center',}}>
                <Image style={{width:100,height:100,borderRadius:50,backgroundColor:'white',borderWidth:2,borderColor:LIGHT_GREY,}} source={{uri: this.state.userDetails.image != null ? `${BASE_URL}${this.state.userDetails.image}`  : `` }} />
      <Text style={styles.headerStyleText} >{first_name+ " " + last_name } </Text>
            </View>  */}

          {/* <View style={{}}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("InstituteContacts")} style={{}}>
              <Text numberOfLines={1} style={{ width: 180, height: 150, color: 'white', fontFamily: "Roboto-Regular", fontSize: 12, textAlign: 'right', transform: [{ rotate: '270deg' }], marginBottom: 25, marginTop: 50, }}> <MaterialCommunityIcons name="web" size={12} color="white" /> Visit Igate Website</Text>
            </TouchableOpacity>
          </View> */}

      <View style={styles.userContainer}>
            <Image source={require("../../assets/user.png")} style={{ width: 60, height: 60, borderWidth: 1, borderColor: "#fff", borderRadius: 50 }} />
            <View>
              <Text style={styles.userText} numberOfLines={2}>{this.state.userDetails.first_name}</Text>
              {this.state.userDetails.email == undefined ? null :
                <Text style={{ color: BG_COLOR, fontSize: 10, fontFamily: 'Roboto-Regular', width: WIDTH, marginLeft: heightPercentageToDP(.5), marginTop: heightPercentageToDP(0.4) }} numberOfLines={1}> {this.state.userDetails.email} </Text>
              }

              {this.state.userDetails.mobile_number == undefined ?
                null
                :
                <Text style={{ color: BG_COLOR, fontSize: 10, fontFamily: 'Roboto-Regular', width: WIDTH, marginLeft: heightPercentageToDP(.5), marginTop: heightPercentageToDP(0.4) }}> {this.state.userDetails.mobile_number}  </Text>
              }
            </View>
          </View>

          <View style={{ marginTop: heightPercentageToDP(2) }}>
            <View style={styles.drawer}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Home")} style={styles.listItemStyle}>
                {/* <Ionicons name="md-home" size={24} color="white" /> */}
                <Feather name="home" size={18} color={BG_COLOR} />
                <Text style={styles.listItem}>Home</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.drawer}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("AllCourses")} style={styles.listItemStyle}>
                {/* <FontAwesome name="newspaper-o" size={18} color="white" /> */}
                {/* <Feather name="shopping-bag" size={24} color="white" /> */}
                {/* <AntDesign name="isv" size={22} color="white" /> */}
                <Feather name="shopping-bag" size={18} color={BG_COLOR} />
                <Text style={styles.listItem}>Buy Courses</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.drawer}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("OTS")} style={styles.listItemStyle}>
                {/* <AntDesign name="book" size={23} color="white" /> */}
                {/* <Image source={require("../../assets/exam1.png")} style={{height: 25, width: 25}} resizeMode="contain" /> */}
                <AntDesign name="exception1" size={18} color={BG_COLOR} />
                <Text style={styles.listItem}>Online Test Series</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.drawer}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("YoutubeHome")} style={styles.listItemStyle}>
              <FontAwesome name="file-video-o" size={18} color={BG_COLOR} />
                <Text style={styles.listItem}>Free Videos</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.drawer}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Blogs")} style={styles.listItemStyle}>
              <AntDesign name="profile" size={18} color={BG_COLOR} />      
                <Text style={styles.listItem}>Blogs</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.drawer}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Discussion")} style={styles.listItemStyle}>
                <Octicons name="comment-discussion" size={18} color={BG_COLOR} />                
                <Text style={styles.listItem}>Discussion Forum</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.drawer}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Videos")} style={styles.listItemStyle}>
                <Feather name="book-open" size={18} color={BG_COLOR} />
                <Text style={styles.listItem}>My Courses</Text>
              </TouchableOpacity>
            </View>


            <View style={styles.drawer}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Profile")} style={styles.listItemStyle}>
              <FontAwesome name="user-o" size={18} color={BG_COLOR} />
                {/* <MaterialCommunityIcons name="user" size={23} color="white" /> */}
                <Text style={styles.listItem}>My Account</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.drawer}>
            <TouchableOpacity onPress={this.logOut} style={styles.listItemStyle}>
              {/* <Text style={styles.listItem}>Logout</Text> */}
              <AntDesign name="logout" size={18} color={BG_COLOR} />
              <Text style={styles.listItem}>Logout</Text>

            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
       
        <View style={styles.bottomContainer}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate("DeveloperContact")} style={{}}>
            {/* <Text style={styles.listItem}>Powered By</Text> */}
            <Image source={require("../../assets/logo.png")} style={{ width: 100, height: 40, resizeMode: 'contain' }} />
          </TouchableOpacity>
        </View>
        </View>
      </LinearGradient>
    );
  }
}


const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    padding: 10,
    marginLeft: heightPercentageToDP(0.6)
  },
  listItem: {
    color: BG_COLOR,
    fontSize: heightPercentageToDP(1.5),
    marginLeft: 12
  },
  listItemStyle: {
    justifyContent: "flex-start",
    flexDirection: 'row',
    alignItems: 'center'
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0
  },
  headerStyleText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'left'
  },
   userContainer: {
    padding: heightPercentageToDP(1),
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: heightPercentageToDP(2)
  },
  userText: {
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
    color:BG_COLOR,
    fontSize: heightPercentageToDP(2),
    width: heightPercentageToDP(15),
    marginLeft: heightPercentageToDP(1)
  }
})
