import React, { useState } from 'react'
import { View, FlatList, ScrollView, StyleSheet, Image, } from 'react-native'
import { heightPercentageToDP as hp , widthPercentageToDP as wp, removeOrientationListener, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons, FontAwesome5} from "@expo/vector-icons"
import { WIDTH, LIGHTGREY, BLUE, NEW_GRAD2 } from '../../utils/utils'
import { BASE_URL } from '../../utils/configs';
import Text from './CustomFontComponent';
import { TouchableOpacity } from 'react-native-gesture-handler'
import { LinearGradient } from "expo-linear-gradient"
const regex = /(<([^>]+)>)/ig;

export default function OrderListComponent(props) {
  const [data, setData] = useState(props.data)

  // const  ViewInvoice = async (itemid) => {
  //   AsyncStorage.getItem("user_token").then(token => {
  //     addToCart(token, itemid, qty).then(res => {
  //       if (res.success) {
  //         console.log("ADDED CART RESPONSE")
  //         console.log(res)
  //         Alert.alert("Added To Cart")
  //         this.setState({
  //           loading: false,
  //           itemcount: res.count
  //         })
  //         //AsyncStorage.setItem('item_count', JSON.stringify(this.state.itemcount));
  //       }
  //     })
  //   })
  // }

  const renderItems = ({ item, index }) => {
    var a = new Date(item.created_at);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year;
    console.log(time);
    return (
      <View>
        {item.product == undefined ? null :
          <TouchableOpacity >
        <TouchableOpacity onPress={() => props.navigation.navigate("OrderDetail", { item: item })} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 3, alignSelf: 'center', width: WIDTH - 20, marginLeft: widthPercentageToDP(2), justifyContent:'space-between', marginTop:30, height:80}} >
        
        <View style={{flexDirection: 'row', alignItems: 'center',alignSelf:'flex-start'}}>
        <View style={{ width: hp("4%"), height: hp("5%"), borderRadius: 3,  }}>
        <Image source={{uri:`${BASE_URL}${item.product.cover_image}`}} style={styles.pic} />
        </View>
        
        </View>
        <View style={{ flexDirection: "column",alignSelf:'flex-start', marginLeft:40 }}>
          <Text style={{ color: "#07a1e8", fontSize: heightPercentageToDP(2), marginVertical: 2, width: wp("50%"),fontFamily:'Roboto-Bold', marginTop:5 }} numberOfLines={1}  >{"ODR# "}{item.order_id}</Text>
          <Text style={{ color: "black", fontSize: heightPercentageToDP(2), marginVertical: 2, width: wp("50%"), marginTop:20,fontFamily:'Roboto-Bold' }} numberOfLines={1}  >{item.product.name}</Text>
        </View>
        <View style={{ flexDirection: "column",alignSelf:'flex-start', justifyContent:'flex-end', marginRight:5, }}>
          <Text style={{ color: "black",  fontSize: heightPercentageToDP(2), marginVertical: 2, marginTop:5, fontFamily:"Lato-Regular", textAlign:'center'  }} numberOfLines={2}  >{time}</Text>
          <Text onPress={() => props.navigation.navigate("ViewInvoice", { item: item })} style={{padding: 5,borderRadius: 4,fontFamily:"Lato-Regular", backgroundColor: "#07a1e8",color: "white", fontSize: heightPercentageToDP(1.6), marginVertical: 2, top:10, justifyContent:'center', textAlign:'center' }} numberOfLines={1}  >View Invoice</Text>
        </View>
        {/* <Text style={{ color: "black", fontSize: 10, marginRight: heightPercentageToDP(5),alignSelf:'flex-start', marginTop:5 }}> {time}</Text> */}
        
      </TouchableOpacity>
        {/* <View style={styles.row}>
        <Image source={{ uri: `${BASE_URL}${item.product.cover_image}` }} style={styles.pic} />
          <View style={{marginTop:-8}}>
            <View style={styles.nameContainer}>
            <Text style={styles.title1}>{"ODR# "}{item.order_id}</Text>
            <Text style={styles.status}>{time}</Text>
            </View>
            <View style={styles.nameContainer}>
            <Text style={styles.title2}>{item.product.name}</Text>
            <Text onPress={() => props.navigation.navigate("ViewInvoice", { item: item })} style={styles.status1}>View Invoice</Text>
            </View>
            <View style={styles.nameContainer1}>
            <Text style={{marginTop: 10, marginLeft: 15, width:170,fontFamily:'Roboto-Bold', marginBottom: 10, fontSize: heightPercentageToDP(2), color: 'white', textAlign:'left' }}>{item.product.name}</Text>
            <TouchableOpacity>
            <Text style={styles.columnRowTxt1}>View Invoice</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View> */}
        <View
              style={{
                borderBottomColor: "#DCDCDC",
                borderBottomWidth: .2,
                marginTop: -3
              }}
            />
      </TouchableOpacity>
          }
      </View>
      
    )
  }
  return (
    <View style={{ marginTop: heightPercentageToDP(-2) }}>
      <FlatList
        style={{ width: "100%", }}
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
  // title1: {
  //   fontSize: 16,
  //   flex: 1,
  //   color: "#07a1e8",
  //   fontFamily:'Roboto-Bold',
  //   marginLeft: 10,
  //   width: 140
  // },
  title1: {
    marginTop: 10, marginLeft: 15,fontFamily:'Roboto-Bold', marginBottom: 10, fontSize: heightPercentageToDP(2), color: "#07a1e8", textAlign:'left'
  },
  status: {
    marginTop: 10, marginBottom: 10, fontSize: heightPercentageToDP(2), color: 'black', fontSize: heightPercentageToDP(2), textAlign:'right', justifyContent:'flex-end', alignItems:'flex-end', alignContent:'flex-end'
  },
  title2: {
    marginTop: 10, marginLeft: 15,fontFamily:'Roboto-Bold', marginBottom: 10, fontSize: heightPercentageToDP(2.1), color: "#000", textAlign:'left'
  },
  status1: {
    marginTop: 10, marginBottom: 10,backgroundColor: "#07a1e8",
    padding: 5,borderRadius: 4,  fontSize: heightPercentageToDP(2.2), color: 'white', fontSize: heightPercentageToDP(2), textAlign:'right', justifyContent:'flex-end', alignItems:'flex-end', alignContent:'flex-end'
  },
  // status: {
  //   fontSize: 14,
  //   color: '#000',
  //   fontWeight: 'normal',
  //   marginRight: 10,
  //   marginLeft: 10
  // },
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
    color: BLUE,
    marginLeft: 10
  },
  row: {
    flexDirection: 'row',
    // alignItems: 'center',
    padding: 10,
    marginTop:15,
    width: WIDTH
  },
  pic: {
    //borderRadius: 30,
    width: 60,
    height: 60,
    borderRadius:4
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent:'space-between'
    //width:widthPercentageToDP(90)
  },
    nameContainer1: {
    flexDirection: 'row',
    justifyContent:'space-between'
    // width: 275,
    // marginTop:5,
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
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#37C2D0",
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    height: 50
  },
  tableRow: {
    flexDirection: "row",
    height: 40,
    alignItems: "center",
    justifyContent: 'space-around',
    marginTop: 20
  },
  columnHeader: {
    width: "20%",
    justifyContent: "center",
    alignItems: "center"
  },
  columnHeaderTxt: {
    color: "white",
    fontWeight: "bold",
  },
  columnRowTxt: {
    textAlign: "justify",
  },
  columnRowTxt1: {
    textAlign: "justify",
    backgroundColor: "white",
    padding: 5,
    marginRight: 10,
    color: 'white',
    textAlign:'right',
    borderRadius: 4
  }
  // columnRowTxt1: {
  //   marginTop: 10, marginLeft: 15, width:100,backgroundColor: "#07a1e8", borderRadius:4, right:30, padding:5, marginBottom: 10, fontSize: heightPercentageToDP(2), color: 'white', fontSize: heightPercentageToDP(2), textAlign:'left'
  // },
});