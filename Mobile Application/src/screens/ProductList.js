import React, { Component } from 'react';
import { StyleSheet, View, Animated, Dimensions, Image, FlatList, AsyncStorage, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Header, LIGHTGREY, BLUE, BG_COLOR, BORDER_RADIUS_BUY_BUTTON, BORDER_RADIUS, LIGHT_GREY } from '../utils/utils';
import { BASE_URL, fetchProducts } from '../utils/configs';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Loader from '../utils/Loader';
import BlankError from '../utils/BlankError';
import AwesomeAlert from 'react-native-awesome-alerts';
import Text from './components/CustomFontComponent';
import Star from 'react-native-star-view';
import {Block} from "expo-ui-kit"

const Screen = {
    height: Dimensions.get('window').height
};

export default class ProductList extends Component {
    constructor(props) {
        super(props);
        this._deltaY = new Animated.Value(0);
        this.state = {
            canScroll: false,
            loading: true,
            subjects: [],
            item: this.props.navigation.state.params.item,
            offset: 0,
            loadingMore:true ,
            token:'',
            packageLocked:false
        };
    }

    componentDidMount = async () => {
        console.log("ITEM LIST")
        console.log(this.state.item);
        // let user = await AsyncStorage.getItem('item_count'); 
        // console.log("FROM ASYNC")
        // console.log(user)
        AsyncStorage.getItem("user_token").then(token => {
            this.setState({
                token:token
            })
            fetchProducts(this.state.item.id, token, this.state.offset,)
                .then(res => {
                    console.log("PRODUCT LIST")
                    if (res.success) {
                        console.log(res)
                        this.setState({
                            loading: false,
                            products: res.products,
                            loadingMore:false
                        })
                    }
                    //console.log(this.state.products)
                })
            })
    }

        loadMore = () => {
            this.setState({
              offset: this.state.offset + 10,
              loadingMore: true
            },() => {
              this.fetchMore()
            })
        }   
      
         fetchMore = () => { 
            const offset = this.state.offset
            fetchProducts(this.state.item.id, this.state.token, this.state.offset,).then(data => {
          if(data.products.length !=0 ){
            
            this.setState({
                products:[...this.state.products,...data.products],
              loadingMore:false
            })
          }else{
            this.setState({
              loadingMore:false
            });
          }
          }); 
        }
      
        _renderFooter =  () =>{
            return (
                <View style={{justifyContent:'center',alignItems:'center',height:heightPercentageToDP(8)}}>
                        { this.state.loadingMore ?  <ActivityIndicator size="large" /> : null }
                </View>
            )
        }


    renderData = ({ item, index }) => {
      return (
        <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseBuys", { item: item })} activeOpacity={.8}>
            <View style={styles.card}>
                <View style={styles.imageContainer}>
                    {/* <Image style={styles.cardImage} source={{ uri: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg' }} /> */}
                    <Image style={styles.cardImage} source={{ uri: `${BASE_URL}${item.cover_image}` }} />
                    <LinearGradient colors={["transparent", "transparent"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
                    {item.product_type == undefined ? null :
                        <View>
                        <Text numberOfLines={1} style={{fontWeight:'normal', fontSize:heightPercentageToDP(1.3), backgroundColor:BG_COLOR, width:heightPercentageToDP(13), color:'white', bottom:heightPercentageToDP(-15), right:0, padding:5 }}>{item.product_type.title}</Text>
                        </View>
                    }
          </LinearGradient>
                </View>
                <View style={styles.cardContent}>
                    <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
                    {/* <Text numberOfLines={2} style={styles.carddescription}>{item.description.replace(regex, '')}</Text> */}
                    {/* <Text style={styles.count}>{'\u20B9'} {item.amount}</Text> */}
                    <Star score={item.average_review} style={styles.starStyle} />
                    {/* <View style={{ flexDirection: 'row', marginLeft: 5 }} >
                        <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                        <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                        <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                        <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                        <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                    </View> */}
                    
                    <View style={{flexDirection:'row'}}>
                {item.finalAmount == 0 ? <Text style={styles.count}>Free</Text>
                :
                <Text style={styles.count}>{'\u20B9'}{item.finalAmount}</Text>
                }
                {item.finalAmount == item.amount ? null :
                <Text style={styles.count1}>{'\u20B9'}{item.amount}</Text>
                }
                </View>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseBuys", {item: item})}>
                    <Block center marginTop={heightPercentageToDP(1)}>
                       <Text style={{ fontSize: heightPercentageToDP(1.3), color: 'white', backgroundColor: BLUE, padding: 10, borderRadius: BORDER_RADIUS_BUY_BUTTON, justifyContent:'center', textAlign:'center', width:widthPercentageToDP(34) }}>Buy Now</Text>
                    </Block> 
                </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    )
    }



    render() {
        return this.state.loading ? <Loader /> : (
            <View style={styles.container}>
                <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title={this.state.item.title} />
                <View style={{ marginTop: 0 }}>
                </View>
                {/* <HeadingText text={"Subjects in " + this.state.item.name} /> */}
                    {this.state.products.length == 0 ? <BlankError text="Nothing found" /> 
                    : 
                    <FlatList
                    refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />}
                    ListFooterComponent={this._renderFooter}   
                    onEndReachedThreshold={.5}
                    numColumns={2}
                    onEndReached={this.loadMore} 
                    data={this.state.products}
                    style={{marginTop:10,marginLeft: heightPercentageToDP(1)}}
                    renderItem={this.renderData}
                />}

        <AwesomeAlert
          show={this.state.packageLocked}
          showProgress={false}
          title={`Subject Locked!`}
          message={`You have not subscribed to this subject. Please upgrade course plan to activate this subject  `}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={true}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="OK"
          confirmButtonColor={BLUE}
          onConfirmPressed={() => {
            this.setState({
              packageLocked: false
            });
          }}
        />

            </View>
        );
    }
    onSnap(event) {
        const { id } = event.nativeEvent;
        if (id === 'bottom') {
            //   this.setState({ canScroll: true });
        }
    }
    onScroll(event) {
        const { contentOffset } = event.nativeEvent;
        if (contentOffset.y <= 0) {
            this.setState({ canScroll: false });
        }
    }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor:'#f2f2f2'
  },
  placeholder: {
      backgroundColor: '#65C888',
      flex: 1,
      height: 120,
      marginHorizontal: 20,
      marginTop: 20
  },
  name:{
      fontSize:28,
      color:"#696969",
      fontWeight:'bold'
    },
    price:{
      marginTop:10,
      fontSize:18,
      color:"green",
      fontWeight:'bold'
    },
    description:{
      textAlign:'center',
      marginTop:10,
      color:"#696969",
    },
     /******** card **************/
  card:{
      marginVertical: 8,
      backgroundColor:"#fff",
      width: widthPercentageToDP(45),
      borderRadius:BORDER_RADIUS,
      marginHorizontal:5.5,
      marginTop:10
    },
    cardContent: {
      paddingVertical: 15,
      justifyContent: 'space-between',
      marginRight:10,
    },
    cardImage:{
      flex: 1,
      height: heightPercentageToDP(18),
      width: null,
      borderRadius:4,
      borderTopLeftRadius:BORDER_RADIUS,
      borderTopRightRadius:BORDER_RADIUS,
      resizeMode:'cover'
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
      fontFamily:'Lato-Medium',
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
      fontFamily:'Lato-Bold',
      color:"#07a1e8",
      marginLeft:10
    },
    count1:{
      fontSize:12,
      fontWeight:'normal',
      color: BG_COLOR,
      marginTop:1.5,
      marginLeft:10,
      textDecorationLine: 'line-through', 
      textDecorationStyle: 'solid',
    },
    pickerWrapper: {
      borderColor: LIGHTGREY,
      borderWidth: .2,
      backgroundColor: "white",
      borderRadius: 4,
      margin:10
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
    starStyle: {
      width: 60,
      height: 12,
      marginLeft:10,
      color:'#FDCC0D',
      tintColor:'#FDCC0D'
    }
});