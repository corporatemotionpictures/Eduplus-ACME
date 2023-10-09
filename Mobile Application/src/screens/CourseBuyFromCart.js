import React, { Component } from 'react';
import { View, Image, TouchableOpacity, ScrollView, Modal, StyleSheet, AsyncStorage, ActivityIndicator, FlatList, Alert, TextInput, Picker, Style, TouchableHighlight, ImageBackground } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, removeOrientationListener, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { BG_COLOR, ORANGE, BLUE, Header, LIGHTGREY, GREEN, WIDTH, LIGHT_BLUE, NEW_GRAD1, NEW_GRAD2, HEIGHT, NEWBLUE, BLUELIGHT, WHITE, LIGHT_GREEN } from '../utils/utils';
import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import { Block, Icon } from 'galio-framework';
import { BASE_URL, fetchCourses, fetchSingleCourses, fetchCartList, fetchSubjects, fetchSubject, fetchProductDetails, addToCart } from '../utils/configs';
import { List } from "react-native-paper"
import Loader from '../utils/Loader';
import { LinearGradient } from "expo-linear-gradient"
import { NavigationEvents } from 'react-navigation';
import SelectableItems from './components/SelectableItems';
import Rating from './components/Rating';
import Star from './components/Star';
import PercentageBar from './components/PercentageBar';
import RBSheet from "react-native-raw-bottom-sheet";
import LottieView from "lottie-react-native"
import WebView from "react-native-webview"
import BlankError from '../utils/BlankError';
import CourseSubjectForShowing from './components/CourseSubjectForShowing';
import Text from './components/CustomFontComponent';


const regex = /(<([^>]+)>)/ig;
export const dummyData = [
  {
    picker_value: "1",
    picker_id: 1
  },
  {
    picker_value: "2",
    picker_id: 2
  },
  {
    picker_value: "3",
    picker_id: 3
  },
  {
    picker_value: "4",
    picker_id: 4
  },
  {
    picker_value: "5",
    picker_id: 5
  },
  {
    picker_value: "6",
    picker_id: 6
  },
  {
    picker_value: "7",
    picker_id: 7
  },
  {
    picker_value: "8",
    picker_id: 8
  },
  {
    picker_value: "9",
    picker_id: 9
  },
  {
    picker_value: "10",
    picker_id: 10
  },

]

export default class CourseBuyFromCart extends Component {
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
      seeMoreReview: false,
      Default_Rating: 2,
      Max_Rating: 5,
      successDialog: false,
      addtoloading: false,
      coursename: '',
      subjects: [],
      pickerItem: "[]"
    };

    this.Star = 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/star_filled.png';
    this.Star_With_Border = 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/star_corner.png';

    console.log("ITEM ID")
    console.log(this.state.item.product_id)
    console.log(this.state.item)
  }

  Show_Custom_Alert = () => {
    this.setState({
      successDialog: true,
    });
    setTimeout(() => {
      this.RBSheet.close()
      this.componentWillMount()
      this.setState({
        successDialog: false,
      });
    }, 2000);
  };

  // Show_Custom_Alert(visible) {
  //   this.setState({ 
  //     successDialog: visible 
  //   });
  //   setTimeout(() => {
  //     this.Show_Custom_Alert(!this.state.successDialog);
  //   }, 2000);
  // };

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
    this.fetchcartLength();
    this.getValueLocally();
    console.log("PRODUCT ID")
    console.log(this.state.item.name)
    AsyncStorage.getItem('course_name').then((coursename) => this.setState({ coursename: coursename }))
    AsyncStorage.getItem('item_count').then((value) => this.setState({ itemcount: value }))
    AsyncStorage.getItem("user_token").then(token => {
      this.setState({
        token: token
      })
      fetchProductDetails(this.state.item.product_id, token)
        .then(res => {
          if (res.success) {
            console.log(res)
            this.setState({
              loading: false,
              productdetails: res.product,
              productAttributes: res.product.attributes,
              productCourses: res.product.courses,
              productExams: res.product.exams,
              productReview: res.product.reviews,
              loadingMore: false
            })
            console.log("PRODUCT DETAILS")
            console.log(this.state.productdetails)
            console.log("COURSE DETAILS")
            console.log(this.state.productCourses)
            console.log("EXAM DETAILS")
            console.log(this.state.productExams)
            console.log("REVIEW DETAILS")
            console.log(this.state.productdetails.average_review)
            console.log("FACULTY DETAILS")
            console.log(this.state.productAttributes[5].values)
            console.log("PRODUCT ATTRIBUTES")
            console.log(this.state.productAttributes)
            {
              this.state.productdetails.courses.map((courses, index) => {
                console.log("AFTER MAPPING COURSES")
                console.log(courses)
                this.setState({
                  courseName: courses.name,
                  coursesList: courses
                })
                console.log(this.state.coursesList.subjects)
              })
            }
            {
              this.state.productAttributes.map((attribute, index) => {
                console.log("AFTER MAPPING ATTRIBUTE")
                console.log(attribute.slug)
                console.log(attribute.values)
                if (attribute.slug == "faculty") {
                  console.log("FACULTY VALUE")
                  console.log(attribute.values)
                  this.setState({
                    facultyList: attribute.values,
                  })
                }
              })
            }

            //this.mapping();

          }
        })
    })
  }

  // mapping() {
  //   {this.state.productCourses.subjects.map((chapter, index) => {
  //     console.log("AFTER MAPPING")
  //     console.log(chapter.name)
  //     this.setState({
  //       coursesubject : item.subjects
  //     }, ()=> console.log(this.state.coursesubject))
  //   })
  //   }
  // }

  componentDidMount() {
    this.getValueLocally()
    this.props.navigation.addListener('willFocus', this._handleStateChange);
  }

  _handleStateChange = state => {
    this.getValueLocally()
  };


  handleTab = (val) => {
    this.setState({
      tab: val
    })
  }

  renderCourses = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseDetails", { item: item })} style={{ height: 40, margin: 5, borderBottomColor: '#DCDCDC', borderBottomWidth: .2, flexDirection: 'row', justifyContent: 'space-between', }} >
        <View style={{ flexDirection: 'column', marginLeft: 10, justifyContent: 'center' }}>
          <Text numberOfLines={2} style={{ color: LIGHTGREY, fontSize: 15, width: 280, justifyContent: 'center' }}>{item.name}</Text>
          {/* <Text numberOfLines={1} style={{ color: LIGHTGREY, fontSize: 10, width: 280, justifyContent: 'center' }}>{item.description}</Text> */}
        </View>
      </TouchableOpacity>
      // <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseDetails", { item: item })} >
      //   <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: LIGHTGREY, borderBottomWidth: .5, padding: 10 }}>
      //     <Image style={{ height: heightPercentageToDP(7), width: widthPercentageToDP(14) }} source={{ uri: `${BASE_URL}${item.thumbnail}` }} />
      //     <View style={{ flex: 1, marginLeft: 10 }}>
      //       <Text style={{ color: 'black', fontSize: 16, fontWeight: 'normal' }}>{item.name}</Text>
      //       <Text style={{ color: 'black', fontSize: 14, marginTop: 5, fontWeight: 'normal' }}>{item.description}</Text>
      //     </View>
      //     <View>
      //     </View>
      //   </View>
      // </TouchableOpacity>
      //onPress={() => this.props.navigation.navigate("ExamDetails", { item: item })}
    )
  }

  renderFaculty = ({ item, index }) => {
    console.log("FACULTY DETAIL")
    console.log(item)
    return (
      <View style={{ flex: 1, width: widthPercentageToDP(100), justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
        <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 10, justifyContent: 'center', alignItems: 'center', width: widthPercentageToDP(45), height: 40, borderColor: '#e5e7eb', borderRadius: widthPercentageToDP(1), borderWidth: heightPercentageToDP(.2), elevation: 0, }}>
          {/* <LinearGradient start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 1 }} colors={["#ffffff", "#ffffff"]} style={{ width: 180, height: 40, justifyContent: 'center', borderColor:'#e5e7eb', alignItems: 'center', borderRadius: widthPercentageToDP(1), borderWidth:heightPercentageToDP(.1), elevation: 0, flexDirection: 'row', }}> */}
          {item.image == null ? <Image source={require("../../assets/user-placeholder.png")} style={{ height: 30, width: 30, borderRadius: 15, marginLeft: 5 }} />
            :
            <Image source={{ uri: `${BASE_URL}${item.image}` }} style={{ height: 30, width: 30, borderRadius: 15, marginLeft: 5 }} />
          }
          <Text style={{ flex: 1, width: 100, color: 'black', fontSize: 12, fontFamily: 'Roboto-Regular', marginLeft: heightPercentageToDP(2) }} numberOfLines={1} adjustsFontSizeToFit>
            {item.first_name} {item.last_name}
          </Text>
        </View>
      </View>
    )
  }

  renderReviews = ({ item, index }) => {
    var a = new Date(item.created_at);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = date + ' ' + month + ' ' + year;
    console.log(time);
    return (
      <TouchableOpacity style={{}} >
        <View style={{ flexDirection: 'column', marginLeft: 10, justifyContent: 'center', marginTop: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text numberOfLines={1} style={{ color: 'black', fontWeight: 'bold', fontSize: heightPercentageToDP(1.7) }}>{item.first_name} {item.last_name}</Text>
            <Text style={{ marginLeft: 15, backgroundColor: '#66CD00', borderRadius: 3, width: widthPercentageToDP(8), color: 'white', fontFamily: 'Roboto-Regular', fontSize: heightPercentageToDP(1.5), marginTop: 2, textAlign: 'center' }}>{item.ratting} <Entypo name="star" size={10} color="white" /></Text>
            {/* <Text numberOfLines={1} style={{ color: 'grey', fontSize: heightPercentageToDP(2), marginRight: 15, marginTop: -7, textAlign: 'right', justifyContent: 'flex-end', alignSelf: 'flex-end', alignItems: 'flex-end', alignContent: 'flex-end', marginLeft: 150 }}>{time}</Text> */}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text numberOfLines={1} style={{ color: 'grey', fontSize: heightPercentageToDP(1.5), marginRight: 20, marginTop: -15, textAlign: 'right', justifyContent: 'flex-end', alignSelf: 'flex-end', alignItems: 'flex-end', alignContent: 'flex-end' }}>{time}</Text>
          </View>
          {/* <Text style={{ backgroundColor: '#66CD00', borderRadius: 4, width: widthPercentageToDP(8), color: 'white', fontFamily:'Roboto-Bold', fontSize: heightPercentageToDP(2), textAlign: 'center' }}>{item.ratting} <Entypo name="star" size={10} color="white" /></Text> */}
          {/* <Text numberOfLines={1} style={{ color: LIGHTGREY, fontSize: 15,  }}>{item.ratting}</Text> */}
          {/* <Text onPress={() => this.setState({ seeMoreReview: !this.state.seeMoreReview })} style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(2), marginTop: 10, marginBottom: 2 }} numberOfLines={this.state.seeMoreReview ? null : 1} >{this.state.seeMoreReview ? <Text style={{}}>{item.message.replace(/<\/?[^>]+(>|$)/g, "")}<Text style={{ color: BLUE, fontFamily: 'Roboto-Bold' }}>...Show less</Text></Text> : <Text style={{}}>{item.message.slice(0, 120).replace(regex, '')}...<Text style={{ color: BLUE, fontFamily: 'Roboto-Bold' }}>Show More</Text></Text>}</Text> */}
          {item.message == null ? null :
            <Text numberOfLines={6} style={{ color: 'black', backgroundColor: '#ececec', padding: 10, width: widthPercentageToDP(95), borderRadius: 4, fontSize: heightPercentageToDP(1.5), marginTop: 10, marginBottom: 2 }}>{item.message}</Text>
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
    )
  }

  // setValueLocally=()=>{
  //   AsyncStorage.setItem('item_count', JSON.stringify(this.state.itemcount));
  //   //Alert.alert("Value Stored Successfully.")
  // }

  async getValueLocally() {
    AsyncStorage.getItem('item_count').then((value) => this.setState({ itemcount: value }))
    AsyncStorage.getItem('item_count').then((value) => this.setState({ abcd: value }))
    let val = await AsyncStorage.getItem('item_count')
    //Alert.alert(val)
  }

  fetchcartLength = async () => {
    AsyncStorage.getItem("user_token").then(token => {
      fetchCartList(token).then(data => {
        console.log("CART LIST")
        console.log(data)
        if (data.success) {
          this.setState({
            cartlist: data.carts,
            loading: false
          })
          console.log("CART LENGTH")
          console.log(this.state.cartlist.length)
          this.setState({
            cartlength: this.state.cartlist.length,
          }, () => {
            console.log("CARTLENGTHCORRET" + this.state.cartlength);
          })
        }
      })
    })
  }


  addTo = async () => {
    this.setState({ addtoloading: true })
    AsyncStorage.getItem("user_token").then(token => {
      addToCart(token, this.state.productdetails.id, this.state.PickerQuantityHolder, this.state.selectedAttributes).then(res => {
        if (res.success) {
          this.fetchcartLength();
          console.log("ADDED CART RESPONSE")
          console.log(res)
          //Alert.alert("Added To Cart")
          this.componentWillMount();
          this.Show_Custom_Alert();
          this.setState({
            loading: false,
            itemcount: res.count
          })
          this.setState({ addtoloading: false })
          //AsyncStorage.setItem('item_count', JSON.stringify(this.state.itemcount));
        }
      })
    })
  }

  // handleChange = (item, attribute_id) => {
  //   let attr = {
  //     "attribute_id": attribute_id,
  //     "value_id": item.id
  //   }
  //   if (this.state.selectedAttributes.length >= 1) {
  //     const isExist = this.state.selectedAttributes.filter((obj, i, arr) => {
  //       return obj.attribute_id != attribute_id && obj.value_id != item.id
  //     });
  //     console.log(isExist);
  //     if (isExist.length != 0) {
  //       console.log(this.state.selectedAttributes)
  //       console.log("isExist", isExist)
  //       return
  //     } else {
  //       const resultArr = this.state.selectedAttributes.filter((data,index)=>{
  //         return data.attribute_id != attribute_id;
  //       })
  //       this.setState({
  //         selectedAttributes: [...resultArr,attr]
  //       }, () => {
  //         console.log(">>>>>>>>>>>>>>>>>>>>>>>>>", this.state.selectedAttributes)
  //       })

  //     }
  //   } else {
  //     this.setState({
  //       selectedAttributes: [attr]
  //     }, () => {
  //       console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<", this.state.selectedAttributes);
  //     })
  //   }
  //   console.log(this.state.selectedAttributes)


  // }

  handleChange = (item, attribute_id) => {
    let attr = {
      "attribute_id": attribute_id,
      "value_id": item.id
    }
    this.setState({
      selectedAttributes: [...this.state.selectedAttributes, attr]
    }, () => {
      //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>", this.state.selectedAttributes)
      var dataArr = this.state.selectedAttributes.map(item => {
        return [item.attribute_id, item]
      });
      var maparr = new Map(dataArr);
      const selectAttributeResult = [...maparr.values()];
      console.log("NEW ARRAY ", selectAttributeResult);
      this.setState({
        selectedAttributefinal: selectAttributeResult
      }, () => {
        console.log("FINAL ARRAY ADDING TO CART", this.state.selectedAttributefinal)
      })
    })
  }

  _renderView() {
    return (
      <View
        style={{
          borderBottomColor: "#DCDCDC",
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
          <AntDesign name={i <= this.state.Default_Rating ? "star" : "staro"} size={20} color='gold' />
          {/* <Image
              style={styles.StarImage}
              source={(i <= this.state.Default_Rating) ? { uri: this.Star } : { uri: this.Star_With_Border }} /> */}
        </TouchableOpacity>
      );
    }
    return this.state.loading ? <Loader /> : (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Modal
          visible={this.state.successDialog}
          transparent={true}
          animationType={"fade"}
        >
          <View style={{
            justifyContent: 'center', alignItems: 'center', margin: 140, borderRadius: 10, backgroundColor: '#FFFFFF', shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5
          }}>
            <Text style={styles.Alert_Title}>Added To Cart</Text>
            <LottieView
              autoPlay
              source={require("../utils/shoppingcart.json")}
              style={{ height: 80, width: 80, textAlign: 'center', justifyContent: 'center', alignSelf: 'center', alignItems: 'center', alignContent: 'center' }}
              resizeMode="contain"
              hardwareAccelerationAndroid
            />
            {/* <TouchableHighlight onPress={() => { this.Show_Custom_Alert(!this.state.successDialog), this.RBSheet.close(), this.componentWillMount() }} style={{ backgroundColor: BLUE, height: heightPercentageToDP(7), width: widthPercentageToDP(40), borderRadius: 4, bottom: 5, justifyContent: 'center', alignItems: 'center', alignContent: 'center', alignSelf: 'center' }} >
                <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} >
                  <Text style={{ color: 'white', fontSize: heightPercentageToDP(2.5), fontWeight: 'normal', justifyContent: 'center', alignItems: 'center' }} >Okay</Text>
                </LinearGradient>
              </TouchableHighlight> */}
          </View>
        </Modal>

        <Header title="Course Detail" backIcon onbackIconPress={() => this.props.navigation.goBack()} />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', position: 'absolute', alignSelf: 'flex-end', alignItems: 'flex-end' }}>
          <AntDesign onPress={() => this.props.navigation.navigate("CartList")} name="shoppingcart" size={27} color="white" style={{ marginRight: 15, marginTop: 15 }} />
          <Text style={{ fontSize: heightPercentageToDP(2), justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', color: 'white', backgroundColor: NEW_GRAD2, height: 20, width: 20, borderRadius: 10, position: 'absolute', left: 15, top: 6, textAlign: 'center' }}>{this.state.cartlength}</Text>
        </View>
        <ScrollView>
          <View>

            <ImageBackground source={{ uri: `${BASE_URL}${this.state.item.product.cover_image}` }} style={{ height: heightPercentageToDP(20), width: widthPercentageToDP(100) }} >
              <LinearGradient colors={[BG_COLOR, BLUELIGHT]} start={[0.1, 0.1]} style={{ position: 'absolute', left: 0, bottom: 0, right: 0, opacity: .9, height: heightPercentageToDP(20), }} >
                <Text numberOfLines={2} style={{ color: WHITE, marginHorizontal: heightPercentageToDP(2), marginTop: heightPercentageToDP(2), fontSize: heightPercentageToDP(3), fontWeight: 'bold' }}>{this.state.item.product.name}</Text>
                <Block marginLeft={heightPercentageToDP(2)} color={LIGHTGREY}>
                  <Text style={{ fontSize: heightPercentageToDP(2), color: 'white' }}>{this.state.item.product.model}</Text>

                  <Star score={this.state.item.product.average_review} style={styles.starStyle} />

                </Block>
              </LinearGradient>
            </ImageBackground>


            <ScrollView  style={{backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: heightPercentageToDP(-5)}}>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {/* <Text numberOfLines={1} style={{ color: LIGHTGREY, marginHorizontal: heightPercentageToDP(2), marginTop: heightPercentageToDP(1), fontSize: heightPercentageToDP(3), fontFamily: 'Roboto-Bold' }}>{this.state.item.product.name}</Text> */}
                {/* {this.state.productdetails == undefined ? null :
                <Text style={{ backgroundColor: "#03A2E829", borderRadius: 4, borderWidth:1, borderColor:"#07A1E8", padding: 8, width: widthPercentageToDP(30), color: '#07A1E8', fontFamily:'Roboto-Bold', fontSize: heightPercentageToDP(1.5), marginLeft: 12, marginTop: 10, textAlign: 'center', marginRight:10 }}>
                  {this.state.productdetails.product_type.title}
                </Text>} */}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between',  marginTop: heightPercentageToDP(6) }}>
                  {this.state.productdetails == undefined ? null :
                    (
                      this.state.productdetails.exams.map((exam, index) => {
                        return (
                          <Text style={{ color: '#07A1E8', backgroundColor: '#03A2E829', paddingVertical: heightPercentageToDP(.6), paddingHorizontal: heightPercentageToDP(2), borderWidth: 1, borderColor: "#07A1E8", borderRadius: 4, marginHorizontal: 2, fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Regular' }}>{exam.name}</Text>
                        )
                      })
                    )
                  }
                  {this.state.productdetails == undefined ? null :
                    (
                      this.state.productdetails.courses.map((course, index) => {
                        return (
                          <Text style={{ color: '#07A1E8', backgroundColor: '#03A2E829', paddingVertical: heightPercentageToDP(.6), paddingHorizontal: heightPercentageToDP(2), borderWidth: 1, borderColor: "#07A1E8", borderRadius: 4, marginHorizontal: 2, fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Regular' }}>{course.name}</Text>
                        )
                      })
                    )
                  }
                  {this.state.productdetails == undefined ? null :
                    <Text style={{ color: '#07A1E8', backgroundColor: '#03A2E829', paddingVertical: heightPercentageToDP(.6), paddingHorizontal: heightPercentageToDP(2), borderWidth: 1, borderColor: "#07A1E8", borderRadius: 4, marginHorizontal: 2, fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Regular' }}>{this.state.productdetails.product_type.title}</Text>
                  }
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row' }}>
                {this.state.productdetails == undefined ? null :
                  <Text style={{ marginLeft: 12, marginTop: 10, color: NEWBLUE, fontSize: heightPercentageToDP(2.8), fontFamily: 'Roboto-Bold' }} > {'\u20B9'}{this.state.productdetails.finalAmount}</Text>
                }
                {this.state.productdetails == undefined || this.state.productdetails.taxIncluded == true ? (
                  <Text style={{ marginLeft: 12, marginTop: 15, color: 'black', fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Regular' }} >(including GST)</Text>
                ) : (
                  <Text style={{ marginLeft: 12, marginTop: 15, color: 'black', fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Regular' }} ></Text>
                )
                }
                {this.state.productdetails == undefined || this.state.productdetails.finalAmount == undefined || this.state.productdetails.finalAmount == this.state.item.amount ? null :
                  <Text style={{ textDecorationLine: 'line-through', textDecorationStyle: 'solid', marginLeft: 10, marginTop: 15, color: LIGHTGREY, fontSize: heightPercentageToDP(1.8), fontWeight: 'normal' }} >{'\u20B9'}{this.state.item.amount}</Text>
                }
                {/* {this.state.productdetails.coupon == undefined ? <Text style={{ marginLeft: 12, marginTop: 15, color: '#07A1E8', fontSize: heightPercentageToDP(2), fontFamily:'Roboto-Bold' }} ></Text> :
                <Text style={{ marginLeft: 12, marginTop: 15, color: '#07A1E8', fontSize: heightPercentageToDP(2), fontFamily:'Roboto-Bold' }} >{this.state.productdetails.coupon.amount == undefined ? null : this.state.productdetails.coupon.amount} % Off</Text>
                } */}
                {this.state.productdetails == undefined || this.state.productdetails.coupon == undefined ? null :
                  <Text style={{ marginLeft: 12, marginTop: 15, color: '#07A1E8', fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Bold' }} >{this.state.productdetails.coupon == undefined ? null : this.state.productdetails.coupon.amount} % Off</Text>
                }
              </View>
              {/* {this.state.productdetails == undefined || this.state.productdetails.taxIncluded == true ? (
                <Text style={{ marginLeft: 12, marginTop: 15, color: '#07A1E8', fontSize: heightPercentageToDP(2), fontFamily: 'Roboto-Bold' }} >including GST</Text>
              ) : (
                <Text style={{ marginLeft: 12, marginTop: 15, color: '#07A1E8', fontSize: heightPercentageToDP(2), fontFamily: 'Roboto-Bold' }} ></Text>
              )
              } */}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("1")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "1" ? 6 : .4, borderBottomColor: this.state.tab == "1" ? GREEN : "#DCDCDC", padding: 10, paddingTop: this.state.tab == "1" ? 10 : 16 }}>
                <Text allowFontScaling={false} style={{ color: this.state.tab == "1" ? "black" : "grey", fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Bold', }} >Description</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("2")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "2" ? 6 : .4, borderBottomColor: this.state.tab == "2" ? GREEN : "#DCDCDC", padding: 10, paddingTop: this.state.tab == "2" ? 10 : 16 }}>
                <Text allowFontScaling={false} style={{ color: this.state.tab == "2" ? "black" : "grey", fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Bold' }}>Faculty</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("3")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "3" ? 6 : .4, borderBottomColor: this.state.tab == "3" ? GREEN : "#DCDCDC", padding: 10, paddingTop: this.state.tab == "3" ? 10 : 16 }}>
                <Text allowFontScaling={false} style={{ color: this.state.tab == "3" ? "black" : "grey", fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Bold' }}>Courses</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("4")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "4" ? 6 : .4, borderBottomColor: this.state.tab == "4" ? GREEN : "#DCDCDC", padding: 10, paddingTop: this.state.tab == "4" ? 10 : 16 }}>
                <Text allowFontScaling={false} style={{ color: this.state.tab == "4" ? "black" : "grey", fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Bold' }}>Reviews</Text>
              </TouchableOpacity>
            </View>
         
         </ScrollView>
         
            {this.state.productdetails == undefined || this.state.productdetails.courses == undefined ? null :
              <View style={{ flex: 1 }} >
                {
                  this.state.tab == "3" ?
                    <ScrollView style={{ flex: 1, width: this.state.videoWidth, backgroundColor: 'transparent', }}>
                      {this.state.coursesList == undefined || this.state.coursesList.length == 0 ?
                        <View>
                          <Image source={require("../../assets/evaluation.png")} style={{ justifyContent: 'center', alignContent: 'center', alignSelf: 'center', textAlign: 'center', height: heightPercentageToDP(8), width: heightPercentageToDP(8), marginTop: 15 }} />
                          <Text style={{ textAlign: 'center', fontSize: heightPercentageToDP(2), color: 'black', marginTop: 10 }}>No Courses Available</Text>
                        </View> :
                        (
                          this.state.productdetails.courses.map((coursesdetail, index) => {
                            // console.log("COURSES SUBJECT LIST")
                            // console.log(coursesdetail.subjects)
                            return (
                              <List.Accordion style={{ backgroundColor: "white", borderRadius: 8, borderBottomWidth: .5, borderBottomColor: '#DCDCDC' }} titleStyle={{ color: "black", fontFamily: 'Roboto-Regular', fontSize: heightPercentageToDP(2) }} title={coursesdetail.name}>
                                {
                                  this.state.coursesList == undefined || this.state.coursesList.length == 0 || this.state.productdetails.courses.length == 0 ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: heightPercentageToDP("10%") }}><Text style={{ textAlign: 'center', fontSize: heightPercentageToDP(2), color: 'black', marginTop: 10 }}>No Courses Available</Text></View> :
                                    (
                                      coursesdetail.subjects.map((chapter, index) => {
                                        return (
                                          <List.Accordion style={{ backgroundColor: "white", borderRadius: 8, borderBottomWidth: .5, borderBottomColor: '#DCDCDC' }} titleStyle={{ color: "black", fontFamily: 'Roboto-Regular', fontSize: heightPercentageToDP(1.7) }} title={chapter.name}>
                                            {
                                              this.state.loadingTrack ? <ActivityIndicator size={"large"} color={LIGHTGREY} />
                                                :
                                                <FlatList
                                                  data={chapter.chapters}
                                                  style={{ marginTop: 0 }}
                                                  //ListFooterComponent={this._renderView}
                                                  renderItem={({ item, index }) => {
                                                    return (
                                                      <View>
                                                        <TouchableOpacity style={{ marginHorizontal: 10, borderBottomColor: "#ececec", borderBottomWidth: .5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: heightPercentageToDP(1), }} >
                                                          {/* <Ionicons name="md-play-circle" size={heightPercentageToDP(4)} color={LIGHTGREY} /> */}
                                                          <Image source={require("../../assets/online-class.png")} style={{ height: heightPercentageToDP(3), width: heightPercentageToDP(3) }} />
                                                          <View>
                                                            <Text numberOfLines={2} style={{ color: 'black', width: widthPercentageToDP(75), fontFamily: 'Roboto-Regular', fontSize: heightPercentageToDP(1.5) }}>{item.name}</Text>
                                                            <View style={{ flexDirection: 'row', }}>
                                                              {/* <Text numberOfLines={1} style={{backgroundColor:"#dbefff",padding:5,color:NEWBLUE,borderRadius:4,textAlign:'center',marginTop:5,fontSize:10,}}>Petrolium Engineering</Text> */}
                                                            </View>
                                                          </View>
                                                          <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', }}>
                                                            <Ionicons name="ios-arrow-forward" size={16} color="grey" />
                                                          </View>
                                                        </TouchableOpacity>
                                                      </View>
                                                      // <View>
                                                      //   {this.state.productdetails.courses == 0 ? null :
                                                      //     <CourseSubjectForShowing navigationHome="CourseBuys" navigation={this.props.navigation} horizontal={false} data={chapter.chapters} />
                                                      //   }
                                                      // </View>
                                                    )
                                                  }}
                                                />
                                            }
                                          </List.Accordion>
                                        )

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
                this.state.tab == "4" ?
                  <ScrollView style={{ flex: 1, width: this.state.videoWidth, backgroundColor: 'transparent', }}>
                    {this.state.productdetails.reviews.length == 0 ?
                      <View>
                        <Image source={require("../../assets/evaluation.png")} style={{ justifyContent: 'center', alignContent: 'center', alignSelf: 'center', textAlign: 'center', height: heightPercentageToDP(10), width: heightPercentageToDP(10), marginTop: 15 }} />
                        <Text style={{ textAlign: 'center', fontSize: heightPercentageToDP(2), color: 'black', marginTop: 10 }}>No Reviews Available</Text>
                      </View>
                      :
                      <FlatList
                        //ListFooterComponent={this._renderFooter}
                        onEndReachedThreshold={1}
                        data={this.state.productdetails.reviews}
                        renderItem={this.renderReviews}
                      />}

                  </ScrollView>
                  :
                  <View>

                  </View>
              }
            </View>

            {this.state.item.product.description == undefined ? null
              :
              <View style={{ flex: 1 }} >
                {
                  this.state.tab == "1" ?
                    <Text onPress={() => this.setState({ seeMore: !this.state.seeMore })} style={{ fontSize: heightPercentageToDP(1.5), color: 'black', textAlign: 'justify', marginHorizontal: 10, marginVertical: 7, marginBottom: 10, width: widthPercentageToDP(95), lineHeight: 24 }} numberOfLines={this.state.seeMore ? null : 3} >{this.state.seeMore ? <Text style={{}}>{this.state.item.product.description.replace(/<\/?[^>]+(>|$)/g, "")}{'\n'}<Text style={{ color: NEW_GRAD2, fontFamily: 'Roboto-Bold' }}>...Show less</Text></Text> : <Text style={{}}>{this.state.item.product.description.slice(0, 160).replace(/<\/?[^>]+(>|$)/g, "")}...<Text style={{ color: NEW_GRAD2, fontFamily: 'Roboto-Bold' }}>Show More</Text></Text>}</Text>
                    :
                    <View>
                    </View>
                }
              </View>
            }
          </View>
          <View
            style={{
              borderBottomColor: "#DCDCDC",
              borderBottomWidth: .2,
              marginTop: 10
            }}
          />
          <View>

            <FlatList
              data={this.state.productAttributes}
              //ListFooterComponent={this._renderView}
              renderItem={({ item, index }) => {
                return (
                  <View>
                    {item.values.length == 0 || item.hidden == 1 ? null :
                      <TouchableOpacity>
                        <View style={styles.row}>
                          <AntDesign name="tag" size={16} color="#07A1E8" style={{ marginLeft: 10 }} />
                          <View>
                            <View style={styles.nameContainer}>
                              <Text style={styles.nameTxt} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                              <Text style={styles.nameTxt2}>{item.value}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>}
                  </View>
                  // <View>
                  //   {item.values.length == 0 ? null :
                  //   <View style={{flexDirection:'row'}}>
                  //     <AntDesign name="tag" size={16} color="#07A1E8" style={{ marginLeft:10, marginTop: 10 }} />
                  //     <View style={{ flexDirection: 'row', justifyContent:'space-between' }}>
                  //       <Text style={{ marginTop: 10, marginLeft: 10, marginBottom: 10, fontSize: heightPercentageToDP(2), color: 'grey', textAlign:'left', marginLeft:20 }}>{item.title}</Text>
                  //       <Text style={{ marginTop: 10, marginLeft: 10, marginBottom: 10, fontSize: heightPercentageToDP(2), color: 'black' , justifyContent:'flex-end', alignContent:'flex-end', alignItems:'flex-end', alignSelf:'flex-end', textAlign:'right', marginRight:20}}>{item.value}</Text>  
                  //     </View>
                  //     </View>}


                )
              }}
            />
          </View>

          <View
            style={{
              borderBottomColor: "#DCDCDC",
              borderBottomWidth: .2,
              marginTop: 10
            }}
          />

          {/* {this.state.productdetails == undefined || this.state.productdetails.coupon == undefined ? null :
            <View style={styles.nameContainer}>
              <Text style={styles.nameTxt} numberOfLines={1} ellipsizeMode="tail">Coupon Code</Text>
              <Text style={styles.nameTxt2}>{this.state.productdetails.coupon == undefined ? null : this.state.productdetails.coupon.code}</Text>
            </View>
          }

          <View
            style={{
              borderBottomColor: "#DCDCDC",
              borderBottomWidth: .2,
              marginTop: 10
            }}
          /> */}

          <Text style={styles.descriptiontxv}>
            Student Reviews
          </Text>
          <View style={{ flexDirection: 'row', }}>
            {/* <View style={styles.totalWrap}>
                <Text style={{ fontSize: heightPercentageToDP(6), color: 'black', marginLeft: 5 }}>  0<Entypo name="star" size={24} color="gold" /></Text>
                <Text>0 ratings</Text>
                <Text>and 0 reviews</Text>
              </View>
            </View> : */}
            {/* {this.state.productdetails.average_review == undefined || this.state.productdetails.average_review == null ? null : */}
            <View style={styles.reviewContainer}>
              {this.state.productdetails == undefined || this.state.productdetails.reviews.length == 0 ?
                <View style={styles.totalWrap}>
                  <Text style={{ fontSize: heightPercentageToDP(6), color: 'black', marginLeft: 5, fontWeight: 'bold' }}>  0<Entypo name="star" size={24} color="gold" /></Text>
                  <Text>0 reviews</Text>
                </View> :
                <View style={styles.totalWrap}>
                  <Text style={{ fontSize: heightPercentageToDP(6), color: 'black', marginLeft: 5 }}>  {this.state.productdetails.average_review}<Entypo name="star" size={24} color="gold" /></Text>
                  <Text> {this.state.productdetails.reviews.length} reviews</Text>
                </View>}
            </View>
            <View
              style={{
                height: '70%',
                width: .2,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                backgroundColor: '#DCDCDC',
              }}
            />
            {/* <Text style={styles.amountText}>40 customer reviews</Text> */}
            <View style={{ marginTop: 20, width: widthPercentageToDP(60), marginLeft: 20, marginRight: 10 }}>
              <View style={styles.spacer}>
                {this.state.productdetails == undefined || this.state.productdetails.fivestar == undefined ?
                  <PercentageBar starText="5" percentage={0} totalreview={0} /> :
                  <PercentageBar starText="5" percentage={this.state.productdetails.fivestar} totalreview={this.state.productdetails.reviews.length} />
                }
              </View>
              <View style={styles.spacer}>
                {this.state.productdetails == undefined || this.state.productdetails.fivestar == undefined ?
                  <PercentageBar starText="4" percentage={0} totalreview={0} /> :
                  <PercentageBar starText="4" percentage={this.state.productdetails.fourstar} totalreview={this.state.productdetails.reviews.length} />
                }
              </View>
              <View style={styles.spacer}>
                {this.state.productdetails == undefined || this.state.productdetails.fivestar == undefined ?
                  <PercentageBar starText="3" percentage={0} totalreview={0} /> :
                  <PercentageBar starText="3" percentage={this.state.productdetails.threestar} totalreview={this.state.productdetails.reviews.length} />
                }
              </View>
              <View style={styles.spacer}>
                {this.state.productdetails == undefined || this.state.productdetails.fivestar == undefined ?
                  <PercentageBar starText="2" percentage={0} totalreview={0} /> :
                  <PercentageBar starText="2" percentage={this.state.productdetails.twostar} totalreview={this.state.productdetails.reviews.length} />
                }
              </View>
              <View style={styles.spacer}>
                {this.state.productdetails == undefined || this.state.productdetails.fivestar == undefined ?
                  <PercentageBar starText="1" percentage={0} totalreview={0} /> :
                  <PercentageBar starText="1" percentage={this.state.productdetails.onestar} totalreview={this.state.productdetails.reviews.length} />
                }
              </View>
            </View>
          </View>

          <View
            style={{
              borderBottomColor: "#DCDCDC",
              borderBottomWidth: .2,
              marginTop: 10
            }}
          />

          {/* {this.state.productdetails == undefined || this.state.productdetails.reviews == undefined ? null :
              <View style={{ flex: 1 }} >
                          <FlatList
                            //ListFooterComponent={this._renderFooter}
                            onEndReachedThreshold={.5}
                            data={this.state.productdetails.reviews}
                            renderItem={this.renderReviews}
                          />
                    :
                    <View>
                    </View>
              </View>
            } */}


          {/* </View> */}

          <View style={{ borderTopWidth: .1, marginTop: heightPercentageToDP(1) }} >
          </View>
        </ScrollView>
        {/* <View style={{ backgroundColor: '#ececec', padding: 5 }}> */}
        {/* <View style={{ flexDirection: 'row', marginLeft: 5, marginRight: 5, justifyContent: 'space-between' }}> */}
        {/* <TouchableOpacity style={{ height: heightPercentageToDP(7), width: widthPercentageToDP(40), bottom: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end', alignSelf: 'flex-end' }} >
              <Text style={{ color: 'black', fontSize: heightPercentageToDP(2), fontWeight: 'normal', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 2 }} >Total Amount</Text>
              <Text style={{ color: '#000000', fontSize: heightPercentageToDP(2.5), fontWeight: 'normal', justifyContent: 'flex-end', alignItems: 'flex-end' }} > {'\u20B9'} {this.state.item.amount}</Text>
            </TouchableOpacity>  */}
        {/* <TouchableOpacity onPress={() => this.addTo()} style={{ backgroundColor: BLUE, height: heightPercentageToDP(7), width: widthPercentageToDP(50), borderRadius: 4, bottom: 0, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end', alignSelf: 'flex-end' }} >
              <Text style={{ color: 'white', fontSize: heightPercentageToDP(2.5), fontWeight: 'normal', justifyContent: 'flex-end', alignItems: 'flex-end' }} >Add To Cart</Text>
            </TouchableOpacity>*/}
        {this.state.productdetails == undefined || this.state.productdetails.AddedToCart == undefined ? null :
          <View>
            {this.state.productdetails.AddedToCart == true ? (
              <TouchableHighlight onPress={() => this.props.navigation.navigate("CartList")} style={{ backgroundColor: BLUE, height: heightPercentageToDP(7), width: widthPercentageToDP(95), borderRadius: 4, bottom: 5, justifyContent: 'center', alignItems: 'center', alignContent: 'center', alignSelf: 'center' }} >
                <LinearGradient colors={[LIGHT_GREEN, LIGHT_GREEN]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} >
                  <Text style={{ color: 'white', fontSize: heightPercentageToDP(2.5), fontWeight: 'normal', justifyContent: 'center', alignItems: 'center' }} >Go to Cart</Text>
                </LinearGradient>
              </TouchableHighlight>
            ) : (
              <TouchableHighlight onPress={() => this.RBSheet.open()} style={{ backgroundColor: BLUE, height: heightPercentageToDP(7), width: widthPercentageToDP(95), borderRadius: 4, bottom: 5, justifyContent: 'center', alignItems: 'center', alignContent: 'center', alignSelf: 'center' }} >
                <LinearGradient colors={[LIGHT_GREEN, LIGHT_GREEN]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} >
                  <View style={{ flexDirection: 'row' }}>
                    <AntDesign name="shoppingcart" size={24} color="white" />
                    <Text style={{ color: 'white', fontSize: heightPercentageToDP(2.5), fontWeight: 'normal', justifyContent: 'center', alignItems: 'center' }} > Add to Cart</Text>
                  </View>
                </LinearGradient>
              </TouchableHighlight>
            )}
          </View>
        }
        <RBSheet
          ref={ref => {
            this.RBSheet = ref;
          }}
          // height={300}
          openDuration={250}
          height={heightPercentageToDP(50)}
          closeOnDragDown
          dragFromTopOnly
          customStyles={{
            container: {
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10
            }
          }}
        >
          {/* <Text style={styles.descriptiontxv}>
              Select Quantity
            </Text>
          <View style={[styles.pickerWrapper, { width: widthPercentageToDP(95) }]}>
              <Picker
                placeholder="Select Quantity"
                placeholderStyle={{ color: "white", }}
                placeholderIconColor={"white"}
                mode="dropdown"
                style={{ margin: 5, height: heightPercentageToDP(5) }}
                selectedValue={this.state.PickerQuantityHolder}
                onValueChange={(itemValue, itemIndex) => {
                  this.setState({
                    PickerQuantityHolder: itemValue
                  }, () => {
                    console.log("Quantity Value", this.state.PickerQuantityHolder)
                  })
                }}>
                <Picker.Item label={"Select Quantity"} color={LIGHTGREY} value={null} />
                {
                  dummyData.map((item, index) => {
                    return <Picker.Item label={item.picker_value} color={LIGHTGREY} value={item.picker_id} />
                  })
                }
              </Picker>
              </View>  */}
          <Text style={{ fontSize: heightPercentageToDP(2.5), textAlign: 'center', color: 'black', marginLeft: 10 }}>Select Attribute</Text>
          {this.state.productAttributes.length == 0 ? <BlankError text="No Verient Available" /> :
            <FlatList
              data={this.state.productAttributes}
              //ListFooterComponent={this._renderView}
              renderItem={({ item, index }) => {
                return (
                  <View>
                    {item.values.length == 0 || item.hidden == 1 ? null :
                      <Text style={{ marginTop: 10, marginLeft: 10, marginBottom: 10, fontSize: heightPercentageToDP(2), color: 'black' }}>{item.title}</Text>
                    }
                    {item.values.length == 0 || item.hidden == 1 ? null :
                      <SelectableItems data={item.values} onChange={(e) => {
                        this.handleChange(e, item.attribute_id);
                      }} />
                    }
                  </View>
                )
              }}
            />}
          {this.state.addtoloading ?
            <TouchableOpacity activeOpacity={.7}>
              <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', bottom: 20, right: 20, height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2 }} >
                <ActivityIndicator color="white" />
              </LinearGradient>
            </TouchableOpacity> :
            <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', bottom: 20, right: 20, height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2 }} >
              <View style={{}} >
                <TouchableOpacity onPress={() => { this.addTo() }}  >
                  <AntDesign name="arrowright" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>}
          {/* {this.state.productdetails == undefined || this.state.productdetails.AddedToCart == undefined ? null :
            <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{position: 'absolute', bottom: 20, right: 20, height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2}} >
              <View style={{  }} >
                <TouchableOpacity onPress={() => {this.Show_Custom_Alert()}}  >
                <AntDesign name="arrowright" size={24} color="white" />
                </TouchableOpacity>
              </View>
              </LinearGradient>
          } */}
        </RBSheet>
        {/* </View> */}
      </View>
      // </View>
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
    fontFamily: 'Roboto-Bold',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20
  },
  descriptiontxv: {
    fontSize: 15,
    color: LIGHTGREY,
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
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
  },
  StarImage: {
    width: 40,
    height: 40,
    resizeMode: 'cover'
  },
  textStyle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    marginTop: 15
  },
  reviewContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    width: widthPercentageToDP(40),
    elevation: 0,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: LIGHTGREY,
    textAlign: "center",
  },
  totalWrap: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: 'center',
    alignSelf: 'center',
  },
  amountText: {
    fontSize: 16,
    color: "#595B71",
    textAlign: "center",
  },
  spacer: {
    marginBottom: 14,
  },
  Alert_Main_View: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHTGREY,
    height: 200,
    width: '90%',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 7,
  },
  Alert_Title: {
    marginTop: 10, fontSize: heightPercentageToDP(1.4), color: 'black', textAlign: 'center', justifyContent: 'center', alignSelf: 'center', alignItems: 'center', alignContent: 'center',
  },
  Alert_Message: {
    fontSize: 22,
    color: "#fff",
    textAlign: 'center',
    padding: 10,
    height: '30%'
  },

  buttonStyle: {
    width: '50%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center'
  },

  TextStyle: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
    marginTop: -5
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DCDCDC',
    backgroundColor: '#fff',
    padding: 2,
  },
  pic: {
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
  },
  nameTxt: {
    marginTop: 10, marginLeft: 15, width: 170, marginBottom: 10, fontSize: heightPercentageToDP(1.7), color: 'grey', textAlign: 'left'
  },
  nameTxt2: {
    marginTop: 10, marginLeft: 15, width: 170, marginBottom: 10, fontSize: heightPercentageToDP(1.5), color: 'black', fontSize: heightPercentageToDP(2), textAlign: 'left'
  },
  mblTxt: {
    color: 'black',
    fontSize: heightPercentageToDP(2),
    marginRight: 5,
    marginLeft: 20,
    textAlign: 'justify',
    marginTop: 10
  },
  msgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgTxt: {
    fontWeight: '400',
    color: '#008B8B',
    fontSize: 12,
    marginLeft: 15,
  },
  starStyle: {
    width: 60,
    height: 10,
    color: '#FDCC0D',
    tintColor: '#FDCC0D'
  }
});