import React, { useState } from 'react'
import { View, FlatList, ScrollView, StyleSheet, Image, } from 'react-native'
import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import { WIDTH, LIGHTGREY, BLUE, LIGHT_GREY, BORDER_RADIUS, BG_COLOR, BORDER_RADIUS_BUY_BUTTON, NEW_GRAD1 } from '../../utils/utils'
import { BASE_URL, addToCart } from '../../utils/configs';
import Text from './CustomFontComponent';
import Star from 'react-native-star-view';
import { TouchableOpacity } from 'react-native-gesture-handler'
import { LinearGradient } from "expo-linear-gradient"
const regex = /(<([^>]+)>)/ig;
import { heightPercentageToDP as hp, widthPercentageToDP as wp, heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import {Block} from "expo-ui-kit"

export default function ExamListComponent(props) {
    const [data, setData] = useState(props.data)
    const [loading, setloading] = useState();  
    //console.log(props)

    const  addTo = async (itemid, qty) => {
        AsyncStorage.getItem("user_token").then(token => {
          addToCart(token, itemid, qty).then(res => {
            if (res.success) {
              console.log("ADDED CART RESPONSE")
              console.log(res)
              Alert.alert("Added To Cart")
              this.setState({
                loading: false,
                itemcount: res.count
              })
              //AsyncStorage.setItem('item_count', JSON.stringify(this.state.itemcount));
            }
          })
        })
      }

    const renderItems = ({ item, index }) => {
        return (
            <TouchableOpacity onPress={() => props.navigation.navigate("CourseBuys", { item: item })} activeOpacity={.8}>
                <View style={styles.card}>
                    <View style={styles.imageContainer}>
                        {/* <Image style={styles.cardImage} source={{ uri: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg' }} /> */}
                        <Image style={styles.cardImage} source={{ uri: `${BASE_URL}${item.cover_image}` }} />
                        <LinearGradient colors={["transparent", "transparent"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
                        {item.product_type == undefined ? null :
                            <View>
                            <Text numberOfLines={1} style={{fontWeight:'normal', fontSize:heightPercentageToDP(1.3), backgroundColor:BG_COLOR, width:heightPercentageToDP(13), color:'white', bottom:-138, right:0, padding:5 }}>{item.product_type.title}</Text>
                            </View>
                        }
              </LinearGradient>
                    </View>
                    <View style={styles.cardContent}>
                        <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
                        {/* <Text numberOfLines={2} style={styles.carddescription}>{item.description.replace(regex, '')}</Text> */}
                        {/* <Text style={styles.count}>{'\u20B9'} {item.amount}</Text> */}
                    <Star score={item.average_review} style={styles.starStyle} />                      
                    <View style={{flexDirection:'row'}}>
                    <Text style={styles.count}>{'\u20B9'}{item.finalAmount}</Text>
                    {item.finalAmount == item.amount ? null :
                    <Text style={styles.count1}>{'\u20B9'}{item.amount}</Text>
                    }
                    </View>
                    <TouchableOpacity onPress={() => props.navigation.navigate("CourseBuys", {item: item})}>
                        <View style={{marginLeft:10, marginTop:10, justifyContent:'center', alignItems:'center', alignSelf:'center', alignContent:'center'}}>
                        <Text style={{ fontSize: heightPercentageToDP(1.3), color: 'white', backgroundColor: NEW_GRAD1, padding: 10, borderRadius: 4, justifyContent:'center', textAlign:'center', width:widthPercentageToDP(40) }}>Buy Now</Text>
                        </View> 
                    </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ marginTop: heightPercentageToDP(-2), justifyContent:'center', alignItems:'center' }}>
            <FlatList
                renderItem={renderItems}
                data={data}
                numColumns={2}
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
        backgroundColor: "white",
        flexBasis: '40%',
        borderRadius: 4,
        borderRadius: BORDER_RADIUS,
        borderColor:"#ececec",
        marginHorizontal: 6,
        borderWidth:1,
        marginTop: 20
    },
    cardContent: {
        paddingVertical: 10,
        justifyContent: 'space-between',
        marginRight: 10,
    },
    cardImage: {
        flex: 1,
        height: 160,
        width: null,
        borderRadius: BORDER_RADIUS,
        borderTopLeftRadius: BORDER_RADIUS,
        borderTopRightRadius: BORDER_RADIUS,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
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
        fontSize: 12,
        flex: 1,
        color: "black",
        fontFamily:'Lato-Regular',
        marginLeft: 10,
        width: 140
    },
    status: {
        fontSize: 12,
        flex: 1,
        color: '#000',
        fontWeight: 'normal',
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
        fontSize:14,
        color:BLUE,
        fontFamily: 'Lato-Bold',
        marginLeft:10,
    },
    count1:{
        fontSize:12,
        fontWeight:'normal',
        color:"#000000",
        marginLeft:10,
        marginTop:2,
        fontFamily:'Lato-Regular',
        textDecorationLine: 'line-through', 
        textDecorationStyle: 'solid',
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
    starStyle: {
        width: 60,
        height: 12,
        marginLeft:10,
        color:'#FDCC0D',
        tintColor:'#FDCC0D'
      }
}); 



// import React, { useState } from 'react'
// import { View, FlatList, ScrollView, StyleSheet, Image, } from 'react-native'
// import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
// import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
// import { WIDTH, LIGHTGREY, BLUE, LIGHT_GREY, BORDER_RADIUS, BG_COLOR, BORDER_RADIUS_BUY_BUTTON } from '../../utils/utils'
// import { BASE_URL, addToCart } from '../../utils/configs';
// import Text from './CustomFontComponent';
// import Star from 'react-native-star-view';
// import { TouchableOpacity } from 'react-native-gesture-handler'
// import { LinearGradient } from "expo-linear-gradient"
// const regex = /(<([^>]+)>)/ig;
// import {Block} from "expo-ui-kit"

// export default function ExamListComponent(props) {
//     const [data, setData] = useState(props.data)
//     const [loading, setloading] = useState();  
//     //console.log(props)

//     const  addTo = async (itemid, qty) => {
//         AsyncStorage.getItem("user_token").then(token => {
//           addToCart(token, itemid, qty).then(res => {
//             if (res.success) {
//               console.log("ADDED CART RESPONSE")
//               console.log(res)
//               Alert.alert("Added To Cart")
//               this.setState({
//                 loading: false,
//                 itemcount: res.count
//               })
//               //AsyncStorage.setItem('item_count', JSON.stringify(this.state.itemcount));
//             }
//           })
//         })
//       }

//     const renderItems = ({ item, index }) => {
//         return (
//             <TouchableOpacity onPress={() => props.navigation.navigate("CourseBuys", { item: item })} activeOpacity={.8}>
//                 <View style={styles.card}>
//                     <View style={styles.imageContainer}>
//                         {/* <Image style={styles.cardImage} source={{ uri: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg' }} /> */}
//                         <Image style={styles.cardImage} source={{ uri: `${BASE_URL}${item.cover_image}` }} />
//                         <LinearGradient colors={["transparent", "transparent"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
//                         {item.product_type == undefined ? null :
//                             <View>
//                             <Text numberOfLines={1} style={{fontWeight:'normal', fontSize:heightPercentageToDP(1.3), backgroundColor:BG_COLOR, width:heightPercentageToDP(13), color:'white', bottom:heightPercentageToDP(-15), right:0, padding:5 }}>{item.product_type.title}</Text>
//                             </View>
//                         }
//               </LinearGradient>
//                     </View>
//                     <View style={styles.cardContent}>
//                         <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
//                         {/* <Text numberOfLines={2} style={styles.carddescription}>{item.description.replace(regex, '')}</Text> */}
//                         {/* <Text style={styles.count}>{'\u20B9'} {item.amount}</Text> */}
//                     <Star score={item.average_review} style={styles.starStyle} />                      
//                     <View style={{flexDirection:'row'}}>
//                     <Text style={styles.count}>{'\u20B9'}{item.finalAmount}</Text>
//                     {item.finalAmount == item.amount ? null :
//                     <Text style={styles.count1}>{'\u20B9'}{item.amount}</Text>
//                     }
//                     </View>
//                         <TouchableOpacity onPress={() => props.navigation.navigate("CourseBuys", {item: item})}>
//                         <Block center marginTop={heightPercentageToDP(1)}>
//                            <Text style={{ fontSize: heightPercentageToDP(1.3), color: 'white', backgroundColor: BLUE, padding: 10, borderRadius: BORDER_RADIUS_BUY_BUTTON, justifyContent:'center', textAlign:'center', width:widthPercentageToDP(34) }}>Buy Now</Text>
//                         </Block> 
//                     </TouchableOpacity>
//                     </View>
//                 </View>
//             </TouchableOpacity>
//         )
//     }
//     return (
//         <View style={{ marginTop: heightPercentageToDP(-2), justifyContent:'center', alignItems:'center' }}>
//             <FlatList
//                 renderItem={renderItems}
//                 data={data}
//                 numColumns={2}
//                 //horizontal
//                 //showsHorizontalScrollIndicator={false}
//             />
//         </View>
//     )

// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         marginTop: 20,
//     },
//     list: {
//         paddingHorizontal: 10,
//     },
//     listContainer: {
//         alignItems: 'center'
//     },
//     separator: {
//         marginTop: 10,
//     },
//     /******** card **************/
//     card: {
//         marginVertical: 6,
//         backgroundColor: "white",
//         ///width: widthPercentageToDP(38),
//         flexBasis: '40%',
//         borderRadius: BORDER_RADIUS,
//         borderColor:"#ececec",
//         borderWidth:1,
//         marginTop: 15,
//         elevation:0
       
//     },
//     cardContent: {
//         paddingVertical: 10,
//         justifyContent: 'space-between',

//     },
//     cardImage: {
//         flex: 1,
//         height: heightPercentageToDP(18),
//         width: widthPercentageToDP(37.5),
//         borderRadius: BORDER_RADIUS,
//         borderTopLeftRadius: BORDER_RADIUS,
//         borderTopRightRadius: BORDER_RADIUS,
//         borderBottomLeftRadius: 0,
//         borderBottomRightRadius: 0,
//         resizeMode:'cover'
//     },
//     imageContainer: {
//         shadowColor: "#000",
//         shadowOffset: {
//             width: 0,
//             height: 4,
//         },
//         shadowOpacity: 0.32,
//         shadowRadius: 5.46,
//         elevation: 6,
//     },
//     /******** card components **************/
//     title: {
//         fontSize: 10,
//         flex: 1,
//         color: "black",
//         fontFamily:'Roboto-Medium',
//         marginLeft: 10,
//         width: 120
//     },
//     status: {
//         fontSize: 12,
//         flex: 1,
//         color: '#000',
//         fontWeight: 'normal',
//         marginLeft: 10
//     },
//     carddescription: {
//         fontSize: 12,
//         flex: 1,
//         color: "#000000",
//         marginLeft: 10,
//         width: 140
//     },
//     count: {
//         fontSize:13,
//         color:"#07a1e8",
//         fontFamily:'Roboto-Bold',
//         marginLeft:10,
//         fontWeight:'bold'
//     },
//     count1:{
//         fontSize:12,
//         fontWeight:'normal',
//         color: LIGHT_GREY,
//         marginLeft:10,
//         marginTop:2,
//         fontFamily:'Roboto-Regular',
//         textDecorationLine: 'line-through', 
//         textDecorationStyle: 'solid',
//       },
//     row: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderColor: '#DCDCDC',
//         backgroundColor: '#fff',
//         borderBottomWidth: 1,
//         padding: 10,
//     },
//     pic: {
//         borderRadius: 30,
//         width: 60,
//         height: 60,
//         margin: 10
//     },
//     nameContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         width: 280,
//     },
//     nameTxt: {
//         marginLeft: 15,
//         fontWeight: '600',
//         color: '#222',
//         fontSize: 14,
//         width: 170,
//     },
//     mblTxt: {
//         fontWeight: '200',
//         color: '#777',
//         fontSize: 14,
//     },
//     msgContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     msgTxt: {
//         fontWeight: '400',
//         color: '#008B8B',
//         fontSize: 13,
//         marginLeft: 15,
//     },
//     starStyle: {
//         width: 60,
//         height: 12,
//         marginLeft:10,
//         color:'#FDCC0D',
//         tintColor:'#FDCC0D'
//       }
// }); 