import React, { useState } from 'react'
import { View, Text, FlatList, ScrollView, StyleSheet, Image, AsyncStorage } from 'react-native'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import { WIDTH, LIGHTGREY, BLUE, NEWBLUE, PRICE } from '../../utils/utils'
import { BASE_URL } from '../../utils/configs';
import { TouchableOpacity } from 'react-native-gesture-handler'
import { LinearGradient } from "expo-linear-gradient"
const regex = /(<([^>]+)>)/ig;

export default function CourseSubjectForShowing(props) {
  const [data, setData] = useState(props.data)

  const renderItems = ({ item, index }) => {
    return (
      <View>
        <TouchableOpacity onPress={() => props.navigation.navigate("VideoList",{item:item})} style={{ marginHorizontal: 10, borderBottomColor: "#ececec", borderBottomWidth: .5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: heightPercentageToDP(1), }} >
          {/* <Ionicons name="md-play-circle" size={heightPercentageToDP(4)} color={LIGHTGREY} /> */}
          <Image source={require("../../../assets/online-class.png")} style={{ height: heightPercentageToDP(3), width: heightPercentageToDP(3) }} />
          <View>
            <Text numberOfLines={2} style={{ color: 'black', fontSize: 15, width: widthPercentageToDP(75), fontFamily: 'Roboto-Bold' }}>{item.name}</Text>
            <View style={{ flexDirection: 'row', }}>
              {/* <Text numberOfLines={1} style={{backgroundColor:"#dbefff",padding:5,color:NEWBLUE,borderRadius:4,textAlign:'center',marginTop:5,fontSize:10,}}>Petrolium Engineering</Text> */}
            </View>
          </View>
          <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', }}>
            <Ionicons name="ios-arrow-forward" size={16} color="grey" />
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  return (
    <View style={{ marginTop: heightPercentageToDP(-2) }}>
      <FlatList
        renderItem={renderItems}
        data={data}
      />
    </View>
  )

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
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
    marginTop: 20
  },
  cardContent: {
    paddingVertical: 10,
    justifyContent: 'space-between',
    marginRight: 10
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
    fontSize: 14,
    flex: 1,
    color: "#000000",
    fontWeight: 'normal',
    marginLeft: 10,
    width: 140
  },
  status: {
    fontSize: 12,
    flex: 1,
    color: '#000',
    fontWeight: 'normal',
    marginTop: 10,
    marginLeft: 10
  },
  carddescription: {
    fontSize: 12,
    flex: 1,
    color: "#000000",
    marginLeft: 10,
    width: 140
  },
  count: {
    fontSize: 16,
    flex: 1,
    fontFamily:'Roboto-Bold',
    color: PRICE,
    marginLeft: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DCDCDC',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    padding: 10,
  },
  pic: {
    borderRadius: 30,
    width: 60,
    height: 60,
    margin: 10
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
  },
  nameTxt: {
    marginLeft: 15,
    fontWeight: '600',
    color: '#222',
    fontSize: 14,
    width: 170,
  },
  mblTxt: {
    fontWeight: '200',
    color: '#777',
    fontSize: 14,
  },
  msgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgTxt: {
    fontWeight: '400',
    color: '#008B8B',
    fontSize: 13,
    marginLeft: 15,
  },
});