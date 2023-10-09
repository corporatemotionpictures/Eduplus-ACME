import React, { Component } from "react"
import { Text, Alert, Image, TouchableOpacity } from "react-native"
import { createBottomTabNavigator, BottomTabBar } from 'react-navigation-tabs';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import Home from "./Home"
import Profile from "./Profile"
import { TAB_COLOR, GREY, LIGHT_GREY, NEW_GRAD1, BLUE, GRAD2, GRAD1, GREEN, TAB_ICON_COLOR, LIGHTGREY, LIGHT_BLUE, ORANGE_NEW, BLUE_UP, WHITE, LOGIN_BG, BLACK, RedMunsell, TAB_BG_COLOR, NEW_GRAD2, BG_COLOR } from "../utils/utils"
import { AntDesign, Feather, FontAwesome, Foundation, Octicons, MaterialIcons, Entypo, Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import Paper from "./Paper";
import Videos from "./Videos";
import OTS from "./OTS";
import Discussion from './Discussion'
import PrevSub from "./PrevSub";
import { LinearGradient } from "expo-linear-gradient"
import { hide } from "expo/build/launch/SplashScreen";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen";
import { Block } from "expo-ui-kit"
import { View } from "react-native-animatable";

var VISIBLE = true;

export const setVisiblity = () => {
  VISIBLE = !VISIBLE;
}

const TabBarComponent = props => <BottomTabBar showIcon={true} {...props} />;

const TabScreens = createBottomTabNavigator(

  {
    PrevSub: {
      screen: PrevSub,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <MaterialIcons name="chat-bubble-outline" color={tintColor} size={18} />
        ),
        title: 'Chats'
      }
    },
    Live: {
      screen: Discussion,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome name="newspaper-o" color={tintColor} size={18} />
        ),
        title: "Discussion"
      }
    },

    Home: {
      screen: Home,
      navigationOptions: ({ navigation }) => {
        let tabHide = true
        let routeName = navigation.state.routes[navigation.state.index].routeName
        if (routeName == "VideoPlayer" || routeName == "LivePlayer" || routeName == "OTS") {
          tabHide = false
        }
        return ({
          tabBarIcon: ({ tintColor }) => (
            <Block marginTop={heightPercentageToDP(-2.5)}>
              <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ height: 50, width: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2 }} >
                <AntDesign name="home" size={20} color={WHITE} />
              </LinearGradient>
            </Block>
          ),
          title: 'Home',
          tabBarVisible: tabHide,
        })
      }

    },

    Videos: {
      screen: Videos,
      navigationOptions: ({ navigation }) => {
        let tabHide = true
        let routeName = navigation.state.routes[navigation.state.index].routeName
        console.log(routeName)
        if (routeName == "VideoPlayer") {
          tabHide = false;
        }
        return ({
          tabBarIcon: ({ tintColor }) => (
            <Foundation name="play-video" color={tintColor} size={20} />
          ),
          title: 'Courses',
          tabBarVisible: tabHide
        })
      }
    },
    // Videos: {
    //   screen: Videos,
    //   navigationOptions: {
    //     tabBarIcon: ({ tintColor }) => (
    //       <Entypo name="folder-video" color={tintColor} size={20} />
    //     ),
    //     title: "My Courses"
    //   }
    // },
    Profile: {
      screen: Profile,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <FontAwesome name="user-o" color={tintColor} size={18} />
        ),
        title: "Account"
      }
    },
  },
  {
    initialRouteName: 'Home',
    tabBarOptions: {
      allowFontScaling: false,
      inactiveTintColor: BLUE,
      activeTintColor: "white",
      labelStyle: {
        fontFamily: 'Roboto-Regular',
        //fontSize: heightPercentageToDP(1.3)
      },
      style: {
        backgroundColor: BG_COLOR,
        borderTopWidth: 0,
        paddingBottom: 2.5,
        //paddingTop:2.5,
        height: 50,
      },
      // backgroundColor: TAB_BG_COLOR,
      // borderTopWidth: 0,
      // paddingTop: heightPercentageToDP(2),
      // paddingBottom: heightPercentageToDP(1),
      // paddingLeft: widthPercentageToDP(2),
      // paddingRight: widthPercentageToDP(2.4),
      // height: 50,
      // shadowColor: '#000',
      // shadowOffset: { width: 0, height: 1 },
      // shadowOpacity: 0.5,
      // shadowRadius: 2,
      // borderTopLeftRadius: 30,
      // borderTopRightRadius: 30
    },
    showLabel: true
  },
  {
    tabBarComponent: props => (
      <TabBarComponent {...props} style={{ backgroundColor: '#fff' }} />
    ),
  }
);


export default TabScreens

