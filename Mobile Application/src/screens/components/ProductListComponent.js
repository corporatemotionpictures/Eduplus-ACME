import React,{useState} from 'react'
import { View, Text, FlatList, ScrollView, StyleSheet, Image, AsyncStorage, Alert, ToastAndroid } from 'react-native'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import { BLUE, WIDTH } from '../../utils/utils'
import { BASE_URL, addToCart } from '../../utils/configs';
import { TouchableOpacity } from 'react-native-gesture-handler'
const regex = /(<([^>]+)>)/ig;
import { LinearGradient } from "expo-linear-gradient"


export default function ProductListComponent(props) {
    const [data,setData] = useState("")
    console.log(props.products)

  const  addTo = async (itemid, qty) => {
      AsyncStorage.getItem("user_token").then(token => {
        addToCart(token, itemid, qty).then(res => {
          if (res.success) {
            console.log("ADDED CART RESPONSE")
            console.log(res)
            //this.props.sendData(res.count);
            //Alert.alert("Added To Cart")
            ToastAndroid.show("Added To Cart Successfully", ToastAndroid.SHORT);
            this.setState({
              loading: false,
              itemcount: res.count
            }, ()=>console.log("ITEM COUNT IN PRODUCT LIST" + JSON.stringify(this.state.itemcount)));
          }
        })
      })
    }
    
    return (
       <ScrollView horizontal={props.horizontal}>
           {props.data.item.products == undefined || props.data.item.products.length == 0  ? null : props.data.item.products.map(item =>{
               return (
                <View style={styles.card}>
                  <TouchableOpacity onPress={() => props.navigation.navigate("CourseBuys", {item: item})}>
                  <View style={styles.imageContainer}>
                  <Image style={styles.cardImage} source={{ uri: `${BASE_URL}${item.cover_image}` }} />
              <LinearGradient colors={["transparent", "transparent"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
                {item.product_type == undefined ? null :
                    <View>
                    <Text numberOfLines={1} style={{fontWeight:'normal', fontSize:heightPercentageToDP(1.3), backgroundColor:'#07A1E8', width:heightPercentageToDP(10), color:'white', bottom:heightPercentageToDP(-15), right:0, padding:5 }}>{item.product_type.title}</Text>
                    </View>
                }
              </LinearGradient>  
                  </View>
                  </TouchableOpacity>
                  <View style={styles.cardContent}>
                    <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
                    <View style={{ flexDirection: 'row', marginLeft: 10, }} >
                      <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                      <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                      <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                      <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                      <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                    </View>
                    <View style={{flexDirection:'row'}}>
                    <Text style={styles.count}>{'\u20B9'}{item.finalAmount}</Text>
                    {item.finalAmount == item.amount ? null :
                    <Text style={styles.count1}>{'\u20B9'}{item.amount}</Text>
                    }
                    </View>
                    <TouchableOpacity onPress={() => props.navigation.navigate("CourseBuys", {item: item})}>
                    <View style={{marginLeft:10, marginTop:10, justifyContent:'center', alignItems:'center', alignSelf:'center', alignContent:'center'}}>
                    <Text style={{ fontSize: heightPercentageToDP(1.6), color: 'white', backgroundColor: BLUE, padding: 10, borderRadius: 4, justifyContent:'center', textAlign:'center', width:widthPercentageToDP(35) }}>Buy Now</Text>
                    </View>
                    </TouchableOpacity> 
                    {/* <TouchableOpacity onPress={() => addTo(item.id, 1)}>
                    <Text style={{textAlign:'right', color:BLUE, fontSize:heightPercentageToDP(2), fontWeight:'bold'}}>BUY</Text>
                    </TouchableOpacity> */}
                  </View>
                </View>)
                
           })}
       </ScrollView>
        )         
    };

    const styles = StyleSheet.create({
        container:{
          flex:1,
          marginTop:20,
        },
        list: {
          paddingHorizontal: 10,
        },
        listContainer:{
          alignItems:'center'
        },
        separator: {
          marginTop: 10,
        },
         /******** card **************/
      card:{
        marginVertical: 6,
        backgroundColor:"#f5f5f5",
        flexBasis: '40%',
        borderRadius:4,
        marginHorizontal: 6,
      },
      cardContent: {
        paddingVertical: 15,
        justifyContent: 'space-between',
        marginRight:10,
      },
      cardImage:{
        flex: 1,
        height: 162,
        width: 162,
        borderRadius:4,
        alignContent:'center',
        justifyContent:'center',
        borderBottomLeftRadius:0,
        borderBottomRightRadius:0
      },
      imageContainer:{
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
      title:{
        fontSize:12,
        flex:1,
        color:"#000000",
        marginLeft:10,
        fontWeight:'bold',
        fontFamily:'Roboto-Medium',
        width:140
      },
      carddescription:{
        fontSize:12,
        flex:1,
        color:"#000000",
        marginLeft:10,
        width:140
      },
      count:{
        fontSize:14,
        fontWeight:'bold',
        color:"#07a1e8",
        marginLeft:10
      },
      count1:{
        fontSize:12,
        fontWeight:'normal',
        color:"#000000",
        marginTop:1.5,
        marginLeft:10,
        textDecorationLine: 'line-through', 
        textDecorationStyle: 'solid',
      },
      }); 