import React from "react"
import { Dimensions, StatusBar, TouchableOpacity } from "react-native";
import { EvilIcons, Ionicons, FontAwesome } from "@expo/vector-icons"
import { View, Text, Image, StyleSheet } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen";
export const WIDTH = Dimensions.get("screen").width;
export const HEIGHT = Dimensions.get("screen").height;
import { LinearGradient } from "expo-linear-gradient"

//colors
export const LIGHT_GREEN = "#38c172"
export const GREEN = "#06a0e8"
export const ORANGE = "#FE7B38"
// export const BLUE = "#5654EE"
export const BLUELIGHT = "#5654EE"
export const BLUE = "#0b87df"
export const GREY = "#C0C0C0"
export const LIGHT_GREY = "#575D75"
export const TAB_COLOR = "#161e29"

export const BG_COLOR = "#18005e"

export const LIGHT_BLUE = "#0b87df"
export const TAB_ICON_COLOR = "#a7a7a7"
export const SECONDARY_COLOR = "#232f3e"
export const WHITE = "#fff"
export const BLACK = "#000"
export const RICH_BLACK = "#12191F"

export const LOGIN_BG = "#171846" // majorelle_blue
export const RedMunsell = "#FA7250"



export const GRAD1 = "#001A57"
export const GRAD2 = "#203952"
export const NEW_GRAD1 = "#0b87df"
export const NEW_GRAD2 = "#0b87df"
export const BORDER_RADIUS = widthPercentageToDP(3)
export const BORDER_RADIUS_BUY_BUTTON = 4

export const ORANGES = "#FD7856"
export const LIGHT_ORANGE = "#FE8738"
export const RED_SALSA = "#EE5255"
export const MAJORELLE_BLUE = "#5654EE"
export const TAB_BG_COLOR = "#E8F1FC"


export const styles = {
  container: {
    flex: 1,
    padding: 5
  },
  BG_STYLE: {
    flex: 1,
    // padding:8,
    backgroundColor: '#fff'
  },
  list: {
    paddingHorizontal: 10,
  },
  listContainer: {
    alignItems: 'center'
  },
  separator: {
    marginTop: 10,
  },
  /******** card **************/
  card: {
    marginVertical: 6,
    backgroundColor: "#f5f5f5",
    flexBasis: '40%',
    borderRadius: 4,
    marginHorizontal: 6,
  },
  cardContent: {
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  cardImage: {
    flex: 1,
    height: 160,
    width: 160,
    borderRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  imageContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 6,
  },
  /******** card components **************/
  title: {
    fontSize: 16,
    flex: 1,
    color: "#000000",
    marginLeft: 10
  },
  count: {
    fontSize: 18,
    flex: 1,
    fontWeight: 'bold',
    color: "#000000",
    marginLeft: 10
  },
  card1: {
    marginVertical: 8,
    backgroundColor: "#fff",
    width: widthPercentageToDP(45),
    borderRadius: BORDER_RADIUS,
    borderColor: "#ececec",
    borderWidth: 1,
    marginHorizontal: 5.5,
    marginTop: 10
  },
  cardContent1: {
    paddingVertical: 15,
    justifyContent: 'space-between',
    marginRight: 10,
  },
  cardImage1: {
    flex: 1,
    height: heightPercentageToDP(18),
    width: null,
    borderRadius: 4,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    resizeMode: 'cover'
  },
  imageContainer1: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 6,
  },
  /******** card components **************/
  title1: {
    fontSize: 12,
    flex: 1,
    color: "#000000",
    marginLeft: 10,
    fontFamily: 'Lato-Medium',
    width: 140
  },
  count1: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: "#07a1e8",
    marginLeft: 10
  },
  count2: {
    fontSize: 12,
    fontWeight: 'normal',
    color: BG_COLOR,
    marginTop: 1.5,
    marginLeft: 10,
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  starStyle1: {
    width: 60,
    height: 12,
    marginLeft: 10,
    color: '#FDCC0D',
    tintColor: '#FDCC0D'
  }
}

export const LIGHTGREY = "#014c82"
export const LINEGREY = "#DCDCDC"
export const NEWBLUE = "#07a1e8"
export const LIGHTGREY1 = "#ececec"

export const Header = (props) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', backgroundColor: BG_COLOR }}>
    {props.backIconWithImage ? null : (props.title != null ?
      <View style={{ height: 38, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', width: 300, paddingLeft: 5 }}>

        {props.backIcon == true ? <Ionicons onPress={props.onbackIconPress} name="ios-arrow-back" size={25} color={"white"} s style={{ paddingLeft: 5, paddingRight: 10 }} /> : null}

        {
          props.backIcon == true ?
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', width: widthPercentageToDP(100), }}>
              <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: '500', color: "white", textAlign: 'center', width: widthPercentageToDP(40) }}>{props.title}</Text>
            </View>
            :
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', width: widthPercentageToDP(100), }}>
              <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: '500', color: "white", textAlign: 'center', width: widthPercentageToDP(40) }}>{props.title}</Text>
            </View>
        }
      </View>
      :
      <Image source={require("../../assets/Logo-min-white.png")} style={{ width: 130, resizeMode: 'contain', height: 40, paddingLeft: 25, marginLeft: 20 }} />
    )}

    {
      props.backIconWithImage ?
        <View style={{ height: 38, alignItems: 'center', flexDirection: 'row', width: 300, paddingLeft: 5 }}>
          <Ionicons onPress={props.onbackIconPress} name="ios-arrow-back" size={25} color="white" style={{ paddingLeft: 5, paddingRight: 10 }} />
          <Image source={require("../../assets/Logo-min-white.png")} style={{ width: 130, resizeMode: 'contain', height: 40, }} />

        </View>
        :
        null
    }
    <Ionicons onPress={props.onPress} name={props.rightIcon} size={30} color={"white"} style={{ paddingRight: 10 }} />

  </View>
)

