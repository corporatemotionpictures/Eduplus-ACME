import React, { Component } from 'react';
import { View, Image, TouchableOpacity, ScrollView, StyleSheet, AsyncStorage, FlatList, Alert, TextInput, Picker, Style, ActivityIndicator, ImageBackground } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, removeOrientationListener, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { BG_COLOR, BLUE, Header, LIGHTGREY, GREEN, WIDTH,NEWBLUE, LIGHT_BLUE, NEW_GRAD1, NEW_GRAD2, BLUELIGHT, WHITE } from '../utils/utils';
import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import { Block, Icon } from 'galio-framework';
import { BASE_URL, fetchCourses, fetchSingleCourses, fetchSubjects, fetchSubject, fetchProductDetails, addToCart, addReview } from '../utils/configs';
import { List } from "react-native-paper"
import Loader from '../utils/Loader';
import { LinearGradient } from "expo-linear-gradient"

import { NavigationEvents } from 'react-navigation';
import SelectableItems from './components/SelectableItems';
import Rating from './components/Rating';
import WebView from "react-native-webview"
import Textarea from 'react-native-textarea';
import CourseSubject from './components/CourseSubject';
import Text from './components/CustomFontComponent';
import moment from "moment"
const regex = /(<([^>]+)>)/ig;
import Star from 'react-native-star-view';



export default class OrderDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: this.props.navigation.state.params.item,
      loading: true,
      tab: 1,
      loadingTrack: false,
      quantity: '',
      getValue: '',
      selectedCompatibility: '',
      selectedLangauge: '',
      selectedValidity: '',
      productAttributes: '',
      selectedAttributes: [],
      PickerQuantityHolder: 0,
      seeMore: false,
      Default_Rating: 2,
      Max_Rating: 5,
      review:'',
      writemessage:'',
      reviewloading: false,
      pickerItem: "[]"
    };

    this.Star = 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/star_filled.png';
    this.Star_With_Border = 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/star_corner.png';
  }

  UpdateRating(key) {
    this.setState({
      Default_Rating: key
    }, () => {
      console.log("Rating Value", this.state.Default_Rating)
    })
  }


  componentWillMount = async () => {
    console.log("RATING")
    console.log(this.props.defaultRating)
    console.log("PRODUCT ID")
    console.log(this.state.item.product.id)
    AsyncStorage.getItem("user_token").then(token => {
      this.setState({
        token: token
      })
      fetchProductDetails(this.state.item.product.id, token)
        .then(res => {
          if (res.success) {
            console.log(res)
            this.setState({
              loading: false,
              productdetails: res.product,
              productAttributes: res.product.attributes,
              loadingMore: false
            })
            console.log("PRODUCT ATTRIBUTES")
            console.log(this.state.productAttributes)
            {this.state.productAttributes.map((attribute, index) => {
              console.log("AFTER MAPPING ATTRIBUTE")
              console.log(attribute.slug)
              console.log(attribute.values)
              if(attribute.slug == "faculty") {
                console.log("FACULTY VALUE")
                console.log(attribute.values)
                this.setState({
                  facultyList: attribute.values,
                })
              }
            })

            }
          }
        })
    })
  }

  addRating= async () => {
    if(this.state.writemessage == "") {
      this.setState({
        messagesend: null
      })
     } else{
       this.setState({
         messagesend: this.state.writemessage
       })
     }
    this.setState({ reviewloading: true })
    AsyncStorage.getItem("user_token").then(token => {
      addReview(token, this.state.Default_Rating, this.state.messagesend, this.state.item.product.id).then(res => {
        if (res.success) {
          console.log("REVIEW ADDED")
          console.log(res)
          Alert.alert("Thanks For Rating...")
          this.setState({
            loading: false,
            reviewid: res.id
          })
          this.setState({ reviewloading: false })
        }
      })
    })
  }


  handleTab = (val) => {
    this.setState({
      tab: val
    })
  }

  renderCourses = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseDetails", { item: item })} style={{ height: 40, margin: 5, borderBottomColor: LIGHTGREY, borderBottomWidth: .5, flexDirection: 'row', justifyContent: 'space-between', }} >
        <View style={{ flexDirection: 'column', marginLeft: 10, justifyContent: 'center' }}>
          <Text numberOfLines={2} style={{ color: LIGHTGREY, fontSize: 15, width: 280, justifyContent: 'center' }}>{item.full_name}</Text>
          <Text numberOfLines={1} style={{ color: LIGHTGREY, fontSize: 10, width: 280, justifyContent: 'center' }}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  renderFaculty = ({ item, index }) => {
    console.log("FACULTY DETAIL")
    console.log(item)
    return (
      <View style={{flex:1, width:widthPercentageToDP(100), justifyContent:'center', alignItems:'center', alignContent:'center'}}>
      <View style={{ flexDirection:'row', marginTop:10, marginLeft:10,  justifyContent:'center', alignItems:'center', width:widthPercentageToDP(45), height:40, borderColor:'#e5e7eb',borderRadius: widthPercentageToDP(1), borderWidth:heightPercentageToDP(.2), elevation: 0,}}>
      {/* <LinearGradient start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 1 }} colors={["#ffffff", "#ffffff"]} style={{ width: 180, height: 40, justifyContent: 'center', borderColor:'#e5e7eb', alignItems: 'center', borderRadius: widthPercentageToDP(1), borderWidth:heightPercentageToDP(.1), elevation: 0, flexDirection: 'row', }}> */}
        {item.image == null || item.image ? <Image source={require("../../assets/user-placeholder.png")} style={{ height:30, width:30, borderRadius:15, marginLeft:5 }} />
        :
        <Image source={{ uri: `${BASE_URL}${item.image}` }} style={{ height:30, width:30, borderRadius:15, marginLeft:5 }} />  
        }
        <Text style={{flex:1, width:100, color: 'black', fontSize: 12, fontFamily:'Roboto-Regular', marginLeft:heightPercentageToDP(2) }} numberOfLines={1} adjustsFontSizeToFit>
        {item.first_name} {item.last_name}
        </Text>
        </View>
        </View>
    )
  }


  _renderView() {
    return (
      <View
        style={{
          borderBottomColor: '#DCDCDC',
          borderBottomWidth: .2,
          marginTop: 10
        }}
      />
    )
  }

  render() {
      let React_Native_Rating_Bar = [];
      for (var i = 1; i <= this.state.Max_Rating; i++) {
        React_Native_Rating_Bar.push(
          <TouchableOpacity
            activeOpacity={0.7}
            key={i}
            onPress={this.UpdateRating.bind(this, i)}>
              <Entypo name={ i <= this.state.Default_Rating ? "star" : "star-outlined"} size={30} color='#FFCC48' />
          </TouchableOpacity>
        );
      }
    return this.state.loading ? <Loader /> : (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Header title="Order Detail" backIcon onbackIconPress={() => this.props.navigation.goBack()} />
        <ScrollView>
          <View>

          <View>
              <ImageBackground source={{ uri: `${BASE_URL}${this.state.item.product.cover_image}` }} style={{ height: heightPercentageToDP(19), width: widthPercentageToDP(100) }} >
                <LinearGradient colors={[BG_COLOR, BLUELIGHT]} start={[0.1, 0.1]}style={{ position: 'absolute', left: 0, bottom: 0, right: 0, opacity: .9, height: heightPercentageToDP(19) }} >
                <Text numberOfLines={2} style={{ color: WHITE, marginHorizontal: heightPercentageToDP(2), marginTop: heightPercentageToDP(2), fontSize: heightPercentageToDP(3), fontWeight: 'bold' }}>{this.state.item.product.name}</Text>
                <Block marginLeft={heightPercentageToDP(2)} color={LIGHTGREY}>
                  <Text style={{ fontSize: heightPercentageToDP(2), color: 'white'}}>{this.state.item.product.model}</Text>
                  
                    <Star score={this.state.item.product.average_review} style={styles.starStyle} />
                    {this.state.productdetails == undefined ? null :
                    <Text style={{ backgroundColor:"#03A2E829", borderWidth: 1, borderColor: "white", borderRadius: 4, marginRight:10,  alignContent:'center', alignItems:'center', padding:6, width:widthPercentageToDP(40), color:'white', fontFamily:'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginTop: 10, textAlign:'center' }}>
                    {this.state.productdetails.product_type.title}
                    </Text>}
                    
                  
                  {/* <View style={{borderWidth:1, borderColor: "#fff"}}>
                    <Text style={{ fontSize: heightPercentageToDP(2), color: 'white'}}>{this.state.item.languages}</Text>
                  </View>
                  <Block row>
                  <AntDesign name="eye" size={24} color="white" />
                  <Text style={{ fontSize: heightPercentageToDP(2), color: 'white'}}>{this.state.item.viewed}</Text>
                  </Block> */}
                </Block>
                </LinearGradient>
              </ImageBackground>
            </View>

          {/* <View style={{ height: heightPercentageToDP(55) }}>
              <Image source={{ uri: `${BASE_URL}${this.state.item.product.cover_image}` }} style={{ height: heightPercentageToDP(55), width: widthPercentageToDP(100), marginTop:-5, resizeMode:'cover' }} />
              <LinearGradient colors={["transparent", "transparent"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
                <Text style={{fontSize: heightPercentageToDP(2), color:'white', bottom:8, textAlign:'right', justifyContent:'flex-end', alignSelf:'flex-end', alignContent:'flex-end', alignItems:'flex-end', marginRight:20, backgroundColor:GREEN, padding:10,  position:'absolute'}}>{this.state.item.product.model}</Text>
              </LinearGradient>
            </View> */}



            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text numberOfLines={1} style={{ color: LIGHTGREY, marginHorizontal: heightPercentageToDP(2), marginTop: heightPercentageToDP(1), fontSize: heightPercentageToDP(2), fontWeight: 'bold' }}>{this.state.item.product.name.slice(0, 120)}...</Text>
                {this.state.productdetails == undefined ? null :
                <Text style={{ backgroundColor: "#03A2E829", borderRadius: 4, borderWidth:1, borderColor:"#07A1E8", padding: 6, width: widthPercentageToDP(35), color: '#07A1E8', fontFamily:'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginLeft: 12, marginTop: 7, textAlign: 'center', marginRight:10 }}>
                  {this.state.productdetails.product_type.title}
                </Text>}
              </View> */}
              {/* <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <Text numberOfLines={1} style={{ color: LIGHTGREY, marginHorizontal: heightPercentageToDP(2), marginTop: heightPercentageToDP(2), fontSize: heightPercentageToDP(2.5), fontFamily:'Roboto-Bold' }}>{this.state.item.product.name}</Text>
              {this.state.productdetails == undefined ? null :
            <Text style={{ backgroundColor:"#03A2E829", borderWidth: 1, borderColor: "#07A1E8", borderRadius: 4, marginRight:10, justifyContent:'center', alignContent:'center', alignItems:'center', alignSelf:'center', padding:6, width:widthPercentageToDP(40), color:'#07A1E8', fontFamily:'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginTop: 10, textAlign:'center' }}>
             {this.state.productdetails.product_type.title}
            </Text>}
            </View> */}
              {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                  {this.state.productdetails == undefined ? null :
                    <Text style={{ color: '#07A1E8', backgroundColor: '#03A2E829', paddingVertical: heightPercentageToDP(.6), paddingHorizontal: heightPercentageToDP(2), borderWidth: 1, borderColor: "#07A1E8", borderRadius: 4, marginHorizontal: 2, fontSize:heightPercentageToDP(1.8) }}>{this.state.productExams[0].name}</Text>
                  }
                  {this.state.productdetails == undefined ? null :
                    <Text style={{ color: '#07A1E8', backgroundColor: '#03A2E829', paddingVertical: heightPercentageToDP(.6), paddingHorizontal: heightPercentageToDP(2), borderWidth: 1, borderColor: "#07A1E8", borderRadius: 4, marginHorizontal: 2, fontSize:heightPercentageToDP(1.8) }}>{this.state.productCourses[0].name}</Text>
                  }
                  {this.state.productdetails == undefined ? null :
                    <Text style={{ color: '#07A1E8', backgroundColor: '#03A2E829', paddingVertical: heightPercentageToDP(.6), paddingHorizontal: heightPercentageToDP(2), borderWidth: 1, borderColor: "#07A1E8", borderRadius: 4, marginHorizontal: 2, fontSize:heightPercentageToDP(1.8) }}>{this.state.productdetails.product_type.title}</Text>
                  }
                </View>
              </ScrollView> */}
            
              <View style={{ flexDirection: 'row' }}>
                {this.state.productdetails == undefined ? null :
                  <Text style={{ marginLeft: 12, marginTop: 10, color: NEWBLUE, fontSize: heightPercentageToDP(2.5), fontFamily: 'Roboto-Bold' }} > {'\u20B9'}{this.state.productdetails.finalAmount}</Text>
                }
                {this.state.productdetails == undefined || this.state.productdetails.taxIncluded == true ? (
                <Text style={{ marginLeft: 12, marginTop: 10, color: 'black', fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Regular' }} >(including GST)</Text>
                ) : (
                <Text style={{ marginLeft: 12, marginTop: 10, color: 'black', fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Regular' }} ></Text>
                )
                }
                {/* {this.state.productdetails == undefined || this.state.productdetails.finalAmount == undefined || this.state.productdetails.finalAmount == this.state.item.amount ? null :
                     <Text style={{ textDecorationLine: 'line-through', textDecorationStyle: 'solid', marginLeft: 10, marginTop: 15, color: LIGHTGREY, fontSize: heightPercentageToDP(1.8), fontWeight: 'normal' }} >{'\u20B9'}{this.state.item.amount}</Text>
                    } */}

                {this.state.productdetails == undefined || this.state.productdetails.coupon == undefined ? null :
                  <Text style={{ marginLeft: 12, marginTop: 15, color: '#07A1E8', fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Bold' }} >{this.state.productdetails.coupon == undefined ? null : this.state.productdetails.coupon.amount} % Off</Text>
                }
              </View>
            
            {/* <View>
              <Text numberOfLines={2} style={{ color: LIGHTGREY, marginHorizontal: heightPercentageToDP(2), marginTop: heightPercentageToDP(2), fontSize: heightPercentageToDP(3) }}>{this.state.item.product.name}</Text>
              <View style={{flexDirection:'row', justifyContent:'space-between'}}>
              {this.state.productdetails == undefined ? null :
            <Text style={{ backgroundColor:NEW_GRAD2, borderRadius:4, padding:8, width:widthPercentageToDP(30), color:'white', fontFamily:'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginLeft: 12, marginTop: 10, textAlign:'center' }}>
              {this.state.productdetails.product_type.title}
            </Text>}
            <Text onPress={() => this.props.navigation.navigate("ViewInvoice", { item: this.state.item })} style={{ backgroundColor:"#07a1e8", borderRadius:4, padding:8, width:widthPercentageToDP(20), color:'white', fontFamily:'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginLeft: 12, marginTop: 10, textAlign:'center', justifyContent:'center', marginRight:10}} > View Invoice</Text>
            </View>
            <Text style={{ marginLeft:12, marginTop:10, color: '#000000', fontSize: heightPercentageToDP(3), fontFamily:'Roboto-Bold'}} > {'\u20B9'}{this.state.item.amount}</Text>
            </View> */}
           
            {/* <Text onPress={() => this.setState({ seeMore: !this.state.seeMore })} style={{ color: 'black', textAlign: 'justify', marginHorizontal: 10, marginVertical: 7, marginBottom: 10, width: widthPercentageToDP(95), }} numberOfLines={this.state.seeMore ? null : 3} >{this.state.seeMore ? <Text style={{}}>{this.state.item.product.description.replace(regex, '')}{'\n'}<Text style={{ color: BLUE, fontFamily: 'Roboto-Bold' }}>...Show less</Text></Text> : <Text style={{}}>{this.state.item.product.description.slice(0, 120).replace(regex, '')}...<Text style={{ color: BLUE, fontFamily: 'Roboto-Bold' }}>Show More</Text></Text>}</Text> */}
              {/* <Text style={{color:LIGHTGREY, justifyContent:'center', textAlign:'justify',marginLeft:5, marginRight:5}}>{this.state.item.product.description.replace(regex, '')}</Text> */}
              {/* <WebView 
              style={{height:heightPercentageToDP(100), fontSize:heightPercentageToDP(3)}} 
              originWhitelist={['*']}
              scalesPageToFit={false}
              source={{html:this.state.item.product.description}} /> */}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("1")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "1" ? 6 : .4, borderBottomColor: this.state.tab == "1" ? GREEN : "#DCDCDC", padding: 10, paddingTop: this.state.tab == "1" ? 10 : 16 }}>
                <Text style={{ color: this.state.tab == "1" ? "black" : "grey", fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Bold', }} >Description</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("2")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "2" ? 6 : .4, borderBottomColor: this.state.tab == "2" ? GREEN : "#DCDCDC", padding: 10, paddingTop: this.state.tab == "2" ? 10 : 16 }}>
                <Text style={{ color: this.state.tab == "2" ? "black" : "grey", fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Bold' }}>Faculty</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("3")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "3" ? 6 : .4, borderBottomColor: this.state.tab == "3" ? GREEN : "#DCDCDC", padding: 10, paddingTop: this.state.tab == "3" ? 10 : 16 }}>
                <Text style={{ color: this.state.tab == "3" ? "black" : "grey", fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Bold' }}>Courses</Text>
              </TouchableOpacity>
            </View>
            {this.state.productdetails == undefined ? null :
              <View style={{ flex: 1 }} >
                {
                  this.state.tab == "3" ?
                    <ScrollView style={{ flex: 1, width: this.state.videoWidth, backgroundColor: 'transparent', }}>
                      {
                        (
                          this.state.productdetails.courses.map((coursesdetail, index) => {
                            // console.log("COURSES SUBJECT LIST")
                            // console.log(coursesdetail.subjects)
                            return (
                          <List.Accordion style={{ backgroundColor: "white", borderRadius: 8, borderBottomWidth: .5, borderBottomColor: '#DCDCDC' }} titleStyle={{ color: "black", fontFamily: 'Roboto-Regular', fontSize:heightPercentageToDP(2) }} title={coursesdetail.name}>
                        {this.state.productdetails.courses.length == 0 ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: heightPercentageToDP("20%") }}><ActivityIndicator size="large" color={NEW_GRAD2} /></View> :
                          (
                            coursesdetail.subjects.map((chapter, index) => {
                              return (
                                <List.Accordion style={{backgroundColor:"white",borderRadius:8,borderBottomWidth:.5,borderBottomColor:'#DCDCDC'}} titleStyle={{color:"black",fontFamily:'Roboto-Regular', fontSize:heightPercentageToDP(2)}} title={chapter.name}>
                                  {
                                    this.state.loadingTrack ? <ActivityIndicator size={"large"} color={LIGHTGREY} />
                                      :
                                      <FlatList
                                        data={chapter.chapters}
                                        style={{marginTop:0}}
                                        //ListFooterComponent={this._renderView}
                                        renderItem={({ item, index }) => {
                                          return (
                                            <View>
                                            <TouchableOpacity style={{ marginHorizontal: 10, borderBottomColor: "#ececec", borderBottomWidth: .5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: heightPercentageToDP(1), }} >
                                              {/* <Ionicons name="md-play-circle" size={heightPercentageToDP(4)} color={LIGHTGREY} /> */}
                                              <Image source={require("../../assets/online-class.png")} style={{ height: heightPercentageToDP(3), width: heightPercentageToDP(3) }} />
                                              <View>
                                                <Text numberOfLines={2} style={{ color: 'black', fontSize:heightPercentageToDP(1.7), width: widthPercentageToDP(75), fontFamily: 'Roboto-Regular' }}>{item.name}</Text>
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
                                        }}
                                      />
                                  }
                                </List.Accordion>)
                            })
                          )
                      }
                      </List.Accordion>
                      )
                    })
                      )
                      }
                    </ScrollView>
                    :
                    <View>
                    </View>
                }
              </View>
            }

            {/* <Text style={{justifyContent:'center', textAlign:'center', fontSize:heightPercentageToDP(2), color:'black'}}>No Faculty Available</Text> */}
            {this.state.productdetails == undefined || this.state.productdetails.attributes == undefined ? null :
              <View style={{ flex: 1 }} >
                {
                  this.state.tab == "2" ?
                    <ScrollView style={{ flex: 1, width: this.state.videoWidth, backgroundColor: 'transparent', }}>
                      {
                        this.state.facultyList == undefined || this.state.facultyList.length == 0 ?
                          <View>
                            <Image source={require("../../assets/evaluation.png")} style={{ justifyContent: 'center', alignContent: 'center', alignSelf: 'center', textAlign: 'center', height: heightPercentageToDP(8), width: heightPercentageToDP(8), marginTop: 15 }} />
                            <Text style={{ textAlign: 'center', fontSize: heightPercentageToDP(2), color: 'black', marginTop: 10 }}>No Information Available</Text>
                          </View>
                          :
                          <FlatList
                            // ListFooterComponent={this._renderFooter}
                            // onEndReachedThreshold={.5}
                            numColumns={2}
                            data={this.state.facultyList}
                            renderItem={this.renderFaculty}
                          />
                      }
                    </ScrollView>
                    :
                    <View>

                    </View>
                }
              </View>
            }

            <View style={{ flex: 1 }} >
              {
                this.state.tab == "1" ?
                  // <ScrollView contentContainerStyle={{flexGrow:1}}>
                  //   <WebView
                  //     style={{ height: HEIGHT, fontSize: heightPercentageToDP(3), marginBottom: -30, textAlign: 'justify' }}
                  //     originWhitelist={['*']}
                  //     scalesPageToFit={false}
                  //     source={{ html: this.state.item.description }} />
                  // </ScrollView>
                  // <Text onPress={() => this.setState({ seeMore: !this.state.seeMore })} style={{ color: 'black', textAlign: 'justify', marginHorizontal: 10, marginVertical: 7, marginBottom: 10, width: widthPercentageToDP(95), lineHeight:24, fontSize:heightPercentageToDP(1.5) }} numberOfLines={this.state.seeMore ? null : 3} >{this.state.seeMore ? <Text style={{}}>{this.state.item.product.description.replace(regex, '')}{'\n'}<Text style={{ color: BLUE, fontFamily: 'Roboto-Bold' }}>...Show less</Text></Text> : <Text style={{}}>{this.state.item.product.description.slice(0, 120).replace(regex, '')}...<Text style={{ color: BLUE, fontFamily: 'Roboto-Bold' }}>Show More</Text></Text>}</Text>
                  <Text onPress={() => this.setState({ seeMore: !this.state.seeMore })} style={{ fontSize: heightPercentageToDP(1.5), color: 'black', textAlign: 'justify', marginHorizontal: 10, marginVertical: 7, marginBottom: 10, width: widthPercentageToDP(95), lineHeight: 24 }} numberOfLines={this.state.seeMore ? null : 3} >{this.state.seeMore ? <Text numberOfLines={2} style={{}}>{this.state.item.product.description.replace(/<\/?[^>]+(>|$)/g, "")}{'\n'}<Text style={{ color: NEW_GRAD2, fontFamily: 'Roboto-Bold' }}>...Show less</Text></Text> : <Text numberOfLines={2} style={{}}>{this.state.item.product.description.slice(0, 160).replace(/<\/?[^>]+(>|$)/g, "")}...<Text style={{ color: NEW_GRAD2, fontFamily: 'Roboto-Bold' }}>Show More</Text></Text>}</Text>
                  :
                  <View>

                  </View>
              }
            </View>
          <View
            style={{
              borderBottomColor: '#DCDCDC',
              borderBottomWidth: .2,
              marginTop: 10
            }}
          />

          {/* <View>
              <Rating data={this.props.defaultRating} />
            </View>  */}

{this.state.productdetails.currentUserCommnet ? 
        <TouchableOpacity style={{}} >
        <View style={{ flexDirection: 'column', marginLeft: 10, justifyContent: 'center', marginTop: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text numberOfLines={1} style={{ color: 'black', fontWeight: 'bold', fontSize: heightPercentageToDP(1.7) }}>{this.state.userDetails}</Text>
            <Text style={{ marginLeft: 15, backgroundColor: '#66CD00', borderRadius: 3, width: widthPercentageToDP(8), color: 'white', fontFamily: 'Roboto-Regular', fontSize: heightPercentageToDP(1.5), marginTop:2, textAlign: 'center' }}>{this.state.productdetails.currentUserCommnet.ratting} <Entypo name="star" size={10} color="white" /></Text>
            {/* <Text numberOfLines={1} style={{ color: 'grey', fontSize: heightPercentageToDP(2), marginRight: 15, marginTop: -7, textAlign: 'right', justifyContent: 'flex-end', alignSelf: 'flex-end', alignItems: 'flex-end', alignContent: 'flex-end', marginLeft: 150 }}>{time}</Text> */}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text numberOfLines={1} style={{ color: 'grey', fontSize: heightPercentageToDP(1.5), marginRight: 20, marginTop: -15, textAlign: 'right', justifyContent: 'flex-end', alignSelf: 'flex-end', alignItems: 'flex-end', alignContent: 'flex-end' }}>{moment(this.state.productdetails.currentUserCommnet.created_at).fromNow()}</Text>
          </View>
          {this.state.productdetails.currentUserCommnet.message == null ? null :
            <Text numberOfLines={6} style={{ color: 'black', backgroundColor:'#ececec', padding:10, width:widthPercentageToDP(95), borderRadius:4, fontSize: heightPercentageToDP(1.5), marginTop: 10, marginBottom: 2 }}>{this.state.productdetails.currentUserCommnet.message}</Text>
          }
        </View>
        <View
          style={{
            borderBottomColor: "#DCDCDC",
            borderBottomWidth: .3,
            marginTop: 5
          }}
        />
      </TouchableOpacity>
        :
        <View>
        <Text style={styles.textStyleBig}>
          How was your experience with these course
        </Text>
        <Text style={styles.textStyle}>
            Please Rate us
          </Text>
        <View style={styles.childView}>
            { React_Native_Rating_Bar }
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Textarea
              style={{ backgroundColor: "white", color: "grey", fontSize: 17, padding: 10, }}
              onChangeText={(review) => this.setState({ writemessage: review })}
              maxLength={240}
              placeholder={'Write Your Review...'}
              placeholderTextColor={LIGHTGREY}
              underlineColorAndroid={'transparent'}
              //autoFocus
              containerStyle={{ borderColor: LIGHTGREY, borderWidth: .5, width: WIDTH - 30, borderRadius: 2, height: 150, marginTop: 4, paddingRight: 5 }}
            />
          </View>
            {this.state.reviewloading ? 
             <TouchableOpacity activeOpacity={.7} style={{ marginTop: 20, backgroundColor: BLUE, height: heightPercentageToDP(6), width: widthPercentageToDP(50), borderRadius: 4, bottom: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'center', alignSelf: 'center' }}>
               <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius:4 }} >
                 <ActivityIndicator color="white" />
               </LinearGradient>
             </TouchableOpacity> : <TouchableOpacity onPress={() => { this.addRating() }} activeOpacity={.7} style={{ marginTop: 20, backgroundColor: BLUE, height: heightPercentageToDP(6), width: widthPercentageToDP(50), borderRadius: 4, bottom: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'center', alignSelf: 'center' }}>
                 <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius:4 }} >
                  <Text style={{ color: 'white', fontSize: heightPercentageToDP(2), fontWeight: 'normal', justifyContent: 'flex-end', alignItems: 'flex-end' }} >SUBMIT</Text>
                 </LinearGradient>
              </TouchableOpacity>}
          <View style={{ borderTopWidth: .1, marginTop: heightPercentageToDP(1) }} >
          </View>
          </View>
          }

          
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  placeholder: {
    backgroundColor: '#65C888',
    flex: 1,
    height: 120,
    marginHorizontal: 20,
    marginTop: 20
  },
  name: {
    fontSize: 18,
    color: "#696969",
    fontFamily:'Roboto-Bold',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20
  },
  descriptiontxv: {
    fontSize: 15,
    color: LIGHTGREY,
    fontFamily:'Roboto-Bold',
    marginLeft: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    marginTop: 20
  },
  price: {
    marginTop: 10,
    fontSize: 18,
    color: "green",
    fontFamily:'Roboto-Bold',
    alignSelf: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: 10,
    color: "#696969",
    justifyContent: 'center',
    margin: 5
  },
  pickerWrapper: {
    borderColor: LIGHTGREY,
    borderWidth: .2,
    backgroundColor: "white",
    borderRadius: 4,
    margin: 10
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
  childView: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop:10
  },
StarImage:{
  width: 40,
  height: 40,
  resizeMode: 'cover'
},
textStyle:{
  textAlign: 'center',
  fontSize: 14,
  fontFamily:'Roboto-Regular',
  color: '#000',
  marginTop: 15
  },
  textStyleBig:{
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    fontFamily:'Roboto-Regular',
    marginTop: 15
    },
    starStyle: {
      width: 60,
      height: 12,
      color:'#FDCC0D',
      tintColor:'#FDCC0D'
    }
});