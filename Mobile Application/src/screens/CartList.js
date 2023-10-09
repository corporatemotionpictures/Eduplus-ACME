import React, { Component } from 'react';
import { View, AsyncStorage, FlatList, Image, Modal, TouchableOpacity, TouchableHighlight, Alert, TextInput, BackHandler, ActivityIndicator, ToastAndroid } from 'react-native';
import { styles, Header, LIGHTGREY, BLUE, WIDTH, NEW_GRAD2, NEW_GRAD1, LINEGREY, BLUE1, LIGHT_BLUE, ORANGE, GREEN, BUTTON_COLOR_1, BUTTON_COLOR_2 } from '../utils/utils';
import { fetchNotifications, fetchCartList, removeFromCart, applyCoupon, applyReferral, BASE_URL, resetCoupon, resetReferral } from '../utils/configs';
import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons, Foundation } from "@expo/vector-icons"
import HeadingText from '../utils/HeadingText';
import Loader from '../utils/Loader';
import BlankError from '../utils/BlankError';
import { Block, Icon } from 'galio-framework';
import moment from "moment";
import { LinearGradient } from "expo-linear-gradient"
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import RBSheet from "react-native-raw-bottom-sheet";
import LottieView from "lottie-react-native"
import Text from './components/CustomFontComponent'


export default class CartList extends Component {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      cartlist: [],
      loading: true,
      tab: 1,
      referraltab: 2,
      addcoupon: '',
      couponapp: false,
      couponDialog: false,
      addreferral: '',
      referralapp: false,
      referralDialog: false,
    };
  }

  componentWillUnmount() {
    this.didFocusListener.remove();
  }

  Show_Custom_Alert = () => {
    this.setState({
      couponDialog: true,
    });
    setTimeout(() => {
      this.RBSheet.close()
      this.componentDidMount()
      this.setState({
        couponDialog: false,
      });
    }, 2000);
  };

  Show_Custom_Alert2 = () => {
    this.setState({
      referralDialog: true,
    });
    setTimeout(() => {
      this.RBSheet2.close()
      this.componentDidMount()
      this.setState({
        referralDialog: false,
      });
    }, 2000);
  };

  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        this.setState({
          couponDialog: false,
          referralDialog: false
        })
      },
    );
    AsyncStorage.getItem('item_count').then((value) => this.setState({ itemcountas: value }))
    AsyncStorage.getItem('item_count').then((value) => this.setState({ itemcountas: value }))
    console.log("get value from coursebuy " + JSON.stringify(this.state.itemcountas))
    AsyncStorage.getItem("user_id").then(id => {
      AsyncStorage.getItem("user_token").then(token => {
        fetchCartList(token).then(data => {
          console.log("CART LIST")
          console.log(data)
          if (data.success) {
            this.setState({
              cartlist: data.carts,
              cartprice: data,
              loading: false
            })
            // console.log("CART LENGTH")
            // console.log(this.state.cartlist)
            AsyncStorage.setItem('item_count', JSON.stringify(this.state.cartlist.length));
          }
        })
      })
    })
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    this.props.navigation.goBack();
    return true;
  }

  submitCoupon = async () => {
    this.setState({ couponapp: true })
    if (this.state.addcoupon == "") {
      Alert.alert("referal code is required");
      this.setState({ couponapp: false })
      return;
    }
    AsyncStorage.getItem("user_token").then(token => {
      applyCoupon(token, this.state.addcoupon).then(res => {
        if (res.success) {
          //Alert.alert("Coupon Applied Successfully")
          this.componentDidMount();
          //this.RBSheet.open();
          this.Show_Custom_Alert();
          console.log("AFTER APPLY COUPON")
          console.log(res)
          this.setState({
            loading: false,
            couponapp: false,
            cartlist: res.carts,
          })
          this.setState({ couponapp: false })
          //console.log(this.state.couponres.carts)
        } else if (!res.success) {
          this.setState({ couponapp: false })
        } else {
          this.setState({ couponapp: false })
        }
      })
      this.setState({ couponapp: false })
    })
  }

  submitReferral = async () => {
    this.setState({ referralapp: true })
    if (this.state.addreferral == "") {
      Alert.alert("referral code is required");
      this.setState({ referralapp: false })
      return;
    }
    AsyncStorage.getItem("user_token").then(token => {
      applyReferral(token, this.state.addreferral).then(res => {
        if (res.success) {
          //Alert.alert("Coupon Applied Successfully")
          //this.componentDidMount();
          this.Show_Custom_Alert2();
          console.log("AFTER APPLY REFERRAL CODE")
          console.log(res)
          this.setState({
            loading: false,
            referralapp: false,
            //cartlist: res.carts,
          })
          this.setState({ referralapp: false })
        } else if (!res.success) {
          this.setState({ referralapp: false })
        } else {
          this.setState({ referralapp: false })
        }
      })
      this.setState({ referralapp: false })
    })
  }

  deleteCoupon = async () => {
    AsyncStorage.getItem("user_token").then(token => {
      resetCoupon(token).then(res => {
        if (res.success) {
          console.log(res)
          this.componentDidMount();
          ToastAndroid.show("Coupon Reset Successfully", ToastAndroid.SHORT);
          this.setState({
            loading: false,
            //itemcount: res.count
          })
        }
      })
    })
  };

  deleteReferral = async () => {
    AsyncStorage.getItem("user_token").then(token => {
      resetReferral(token).then(res => {
        if (res.success) {
          console.log(res)
          this.componentDidMount();
          ToastAndroid.show("Referral Reset Successfully", ToastAndroid.SHORT);
          this.setState({
            loading: false,
            //itemcount: res.count
          })
        }
      })
    })
  };

  deleteCartDetail = async (id) => {
    const filteredData = this.state.cartlist.filter(item => item.id !== id);
    this.setState({ cartlist: filteredData });
    AsyncStorage.getItem("user_token").then(token => {
      removeFromCart(token, JSON.stringify(id)).then(res => {
        if (res.success) {
          console.log(res)
          Alert.alert("Removed item successfully")
          this.componentDidMount();
          this.setState({
            loading: false,
            itemcount: res.count
          })
          AsyncStorage.setItem('item_count', JSON.stringify(this.state.itemcount));
          this.setState({ itemcountas: this.state.itemcount });
          console.log("removed value saved successfully " + this.state.itemcountas)
          AsyncStorage.getItem('item_count').then((value) => this.setState({ itemcountas: value }))
          console.log("get removed value saved successfully " + this.state.itemcountas)
        }
      })
    })
  };


  deleteAlert(id) {
    Alert.alert(
      'Confirm',
      'Are you sure that you want to remove?',
      [
        { text: 'Yes', onPress: () => { this.deleteCartDetail(id) } },
        { text: 'Cancel' }
      ],
      //{cancelable: false}
    );
  }

  handleTab = (val) => {
    this.setState({
      tab: val
    })
  }

  referralhandleTab = (val) => {
    this.setState({
      referraltab: val
    })
  }

  renderCartList = ({ item, index }) => {
    console.log("CART LIST RENDER ITEM")
    console.log(item)
    return (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseBuyFromCart", { item: item })} >
        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: LINEGREY, borderBottomWidth: .5, padding: 10 }}>
          {/* <Image source={{ uri: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg' }} style={{ height: heightPercentageToDP(7), width: widthPercentageToDP(14) }} /> */}
          <Image style={{ height: heightPercentageToDP(7), width: widthPercentageToDP(14) }} source={{ uri: `${BASE_URL}${item.product.cover_image}` }} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: 'black', fontSize: 16, fontFamily: 'Lato-Bold' }}>{item.product.name}</Text>
            {/* <Text style={{ color: 'black', fontSize: 14, marginTop: 5, fontWeight: 'normal' }}>{item.coupon_code}</Text> */}
            {/* <Text numberOfLines={2} style={{ color: LIGHTGREY, fontSize: 12 }}>{item.product.description}</Text> */}
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ color: BLUE1, fontSize: 16, marginTop: 5, fontFamily: 'Lato-Bold' }}>{'\u20B9'}{item.amount}</Text>
              {item.amount == item.base_price ? null :
                <Text style={{ color: "#000", fontSize: 12, marginTop: 8, fontFamily: 'Lato-Bold', textDecorationLine: 'line-through', textDecorationStyle: 'solid', marginLeft: 7 }}>{'\u20B9'}{item.base_price}</Text>
              }
              {/* {item.fixed_discount_amount == undefined ? null :
                <Text style={{ color: "#07A1E8", backgroundColor: '#03A2E829', paddingHorizontal: heightPercentageToDP(1), borderWidth: 1, borderColor: "#07A1E8", borderRadius: 4, marginHorizontal: .5, fontSize: 14, marginTop: 10, marginLeft: 20 }}>{item.fixed_discount_amount} off</Text>
              } */}
              {item.fixed_discount_type == undefined ? null :
                <View>
                  {item.fixed_discount_type == "PERCENT" ?
                    <Text numberOfLines={1} style={{ backgroundColor: "#03A2E829", padding: 5, color: "#07A1E8", borderRadius: 4, borderColor: "#07A1E8", borderWidth: 1, textAlign: 'center', marginTop: 5, fontSize: 10, marginLeft: 10, fontSize: 12, }}>{'\u20B9'} {item.fixed_discount_amount} % off</Text> :
                    // <Text style={{ color: "#07A1E8", backgroundColor: '#03A2E829', paddingHorizontal: heightPercentageToDP(1), borderWidth: 1, borderColor: "#07A1E8", borderRadius: 4, marginHorizontal: .5, fontSize: 14, marginTop: 10, marginLeft: 20 }}>{'\u20B9'} {item.fixed_discount_amount} off</Text>
                    <Text numberOfLines={1} style={{ backgroundColor: "#03A2E829", padding: 5, color: "#07A1E8", borderRadius: 4, borderColor: "#07A1E8", textAlign: 'center', marginTop: 5, fontSize: 10, marginLeft: 10, fontSize: 12, }}>{'\u20B9'} {item.fixed_discount_amount} off</Text>
                  }
                </View>
              }
            </View>
          </View>
          <View>
            <TouchableOpacity onPress={this.deleteAlert.bind(this, item.id)}>
              <Icon name="cross" color="red" family="Entypo" size={heightPercentageToDP("2.5")} style={{ padding: widthPercentageToDP(2), right: 5, top: 5, justifyContent: "flex-end", }} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  renderSuggestedCoupon = ({ item, index }) => {
    var a = new Date(item.expiry_date);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = date + ' ' + month + ' ' + year;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: LINEGREY, borderBottomWidth: .5, padding: 10 }}>
        <Foundation name="ticket" size={26} color="#07A1E8" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            {item.amount == undefined ? null :
              <Text style={{ color: 'black', fontSize: 14, fontWeight: 'bold' }}>{item.amount}</Text>
            }
            {item.discount_type == undefined ? null :
              <View>
                {item.discount_type == "PERCENT" ?
                  <Text style={{ color: 'black', fontSize: 12, marginLeft: 2, fontWeight: 'bold' }}>%</Text> :
                  <Text style={{ color: 'black', fontSize: 12, marginLeft: 2, fontWeight: 'bold' }}>{item.discount_type}</Text>
                }
                <Text style={{ color: 'black', fontSize: 12, marginLeft: 15, marginTop: -16, fontWeight: 'bold' }}>off up to {'\u20B9'} {item.amount_upto}</Text>
              </View>
            }
          </View>
          <Text style={{ color: "#07A1E8", backgroundColor: '#03A2E829', paddingHorizontal: heightPercentageToDP(1), width: 80, textAlign: 'center', borderWidth: .5, borderColor: "#07A1E8", borderRadius: 2, marginHorizontal: .5, fontSize: 12, }}>{item.code}</Text>
          <Text style={{ color: '#000', fontSize: 12, marginTop: 2, fontFamily: 'Lato-Bold', }} numberOfLines={3} > {item.description}</Text>
          {/* <Text style={{ color: '#000', fontSize: 12 }}>Expired On {time}</Text> */}
        </View>
        <View style={{ flexDirection: 'column' }}>
          <View style={{}}>
            <TouchableOpacity onPress={() => this.setState({ addcoupon: item.code })} style={{ backgroundColor: BLUE, height: heightPercentageToDP(3.5), width: widthPercentageToDP(15), borderRadius: 4, bottom: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end', alignSelf: 'flex-end' }} >
              <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} >
                <Text style={{ color: 'white', fontSize: heightPercentageToDP(1.5), fontWeight: 'normal', justifyContent: 'flex-end', alignItems: 'flex-end', }} >ADD</Text>
              </LinearGradient>
              <AntDesign name="arrowright" size={16} color="white" style={{ marginLeft: 90 }} />
            </TouchableOpacity>
          </View>
          <View style={{}}>
            <TouchableOpacity onPress={() => this.deleteCoupon()} style={{ backgroundColor: BLUE, height: heightPercentageToDP(3.5), width: widthPercentageToDP(15), borderRadius: 4, bottom: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end', alignSelf: 'flex-end', marginTop: 5 }} >
              <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} >
                <Text style={{ color: 'white', fontSize: heightPercentageToDP(1.5), fontWeight: 'normal', justifyContent: 'flex-end', alignItems: 'flex-end', }} >RESET</Text>
              </LinearGradient>
              <AntDesign name="arrowright" size={16} color="white" style={{ marginLeft: 90 }} />
            </TouchableOpacity>
          </View>
        </View>

      </View>
    )
  }

  renderAppliedCoupon = ({ item, index }) => {
    console.log("APPLIED COUPON")
    console.log(item)
    return (
      <TouchableOpacity >
        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: LINEGREY, borderBottomWidth: .5, padding: 10 }}>
          <Foundation name="ticket" size={20} color="black" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: 'black', fontSize: 13, marginTop: 5, fontFamily: 'Lato-Bold' }}>{item}</Text>
            <Text style={{ color: BLUE, fontSize: 10, marginTop: 2, fontFamily: 'Lato-Bold' }}>{item.description}</Text>
            <View style={{ flexDirection: 'row' }}>
              {item.amount == undefined ? null :
                <Text style={{ color: LIGHTGREY, fontSize: 12 }}>{item.amount}</Text>
              }
              {item.discount_type == undefined ? null :
                <View>
                  {item.discount_type == "PERCENT" ?
                    <Text style={{ color: LIGHTGREY, fontSize: 12, marginLeft: 2 }}>%</Text> :
                    <Text style={{ color: LIGHTGREY, fontSize: 12, marginLeft: 2 }}>{item.discount_type}</Text>
                  }
                </View>
              }
            </View>
          </View>
          {/* <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => this.setState({ addcoupon: item.code })} style={{ backgroundColor: BLUE, height: heightPercentageToDP(5), width: widthPercentageToDP(15), borderRadius: 4, bottom: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end', alignSelf: 'flex-end' }} >
              <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} >
                <Text style={{ color: 'white', fontSize: heightPercentageToDP(2), fontWeight: 'normal', justifyContent: 'flex-end', alignItems: 'flex-end', }} >ADD</Text>
              </LinearGradient>
              <AntDesign name="arrowright" size={16} color="white" style={{ marginLeft: 90 }} />
            </TouchableOpacity>
          </View> */}
        </View>
      </TouchableOpacity>
    )
  }

  renderAppliedReferrel = ({ item, index }) => {
    console.log("APPLIED REFERRAL")
    console.log(item)
    return (
      <TouchableOpacity >
        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: LINEGREY, borderBottomWidth: .5, padding: 10 }}>
          <Foundation name="ticket" size={20} color="black" />
          <View style={{ flex: 1, marginLeft: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: 'black', fontSize: 13, marginTop: 5, fontFamily: 'Roboto-Bold' }}>{item}</Text>
            <TouchableOpacity onPress={() => this.deleteReferral()} style={{ backgroundColor: BLUE, height: heightPercentageToDP(3.5), width: widthPercentageToDP(15), borderRadius: 4, bottom: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end', alignSelf: 'flex-end', marginTop: 5 }} >
              <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} >
                <Text style={{ color: 'white', fontSize: heightPercentageToDP(1.5), fontWeight: 'normal', justifyContent: 'flex-end', alignItems: 'flex-end', }} >RESET</Text>
              </LinearGradient>
              <AntDesign name="arrowright" size={16} color="white" style={{ marginLeft: 90 }} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  _renderFooter = () => {
    return (
      <View
        style={{
          borderBottomColor: LIGHTGREY,
          borderBottomWidth: .1,
        }}
      />
    )
  }

  render() {
    return this.state.loading ? <Loader /> : (
      <View style={styles.BG_STYLE}>
        <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title="My Cart" />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', position: 'absolute', alignSelf: 'flex-end', alignItems: 'flex-end' }}>
          <AntDesign name="shoppingcart" size={27} color="white" style={{ marginRight: 15, marginTop: 15 }} />
          <Text style={{ fontSize: heightPercentageToDP(2), justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', color: 'white', backgroundColor: ORANGE, height: 20, width: 20, borderRadius: 10, position: 'absolute', left: 15, top: 6, textAlign: 'center' }}>{this.state.cartlist.length}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: heightPercentageToDP(2.5), color: BLUE1, margin: 10 }}>Your Cart </Text>
          <Text style={{ fontSize: heightPercentageToDP(2), color: LIGHTGREY, margin: 10 }}>({this.state.cartlist.length}) Item</Text>
        </View>

        <Modal
          visible={this.state.couponDialog}
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
            <Text style={{ marginTop: 10, fontSize: heightPercentageToDP(1.4), color: 'black', textAlign: 'center', justifyContent: 'center', alignSelf: 'center', alignItems: 'center', alignContent: 'center', }}>Coupon Code Applied.</Text>
            <LottieView
              autoPlay
              source={require("../utils/Coupon.json")}
              style={{ height: 80, width: 80, textAlign: 'center', justifyContent: 'center', alignSelf: 'center', alignItems: 'center', alignContent: 'center' }}
              resizeMode="contain"
              hardwareAccelerationAndroid
            />
            {/* <TouchableHighlight onPress={() => { this.Show_Custom_Alert(!this.state.couponDialog), this.RBSheet.close() }} style={{ backgroundColor: BLUE, height: heightPercentageToDP(7), width: widthPercentageToDP(40), borderRadius: 4, bottom: 5, justifyContent: 'center', alignItems: 'center', alignContent: 'center', alignSelf: 'center' }} >
                <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} >
                  <Text style={{ color: 'white', fontSize: heightPercentageToDP(2.5), fontWeight: 'normal', justifyContent: 'center', alignItems: 'center' }} >Okay</Text>
                </LinearGradient>
              </TouchableHighlight> */}
          </View>
        </Modal>
        <Modal
          visible={this.state.referralDialog}
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
            <Text style={{ marginTop: 10, fontSize: heightPercentageToDP(1.4), color: 'black', textAlign: 'center', justifyContent: 'center', alignSelf: 'center', alignItems: 'center', alignContent: 'center', }}>Referral Code Applied.</Text>
            <LottieView
              autoPlay
              source={require("../utils/Coupon.json")}
              style={{ height: 80, width: 80, textAlign: 'center', justifyContent: 'center', alignSelf: 'center', alignItems: 'center', alignContent: 'center' }}
              resizeMode="contain"
              hardwareAccelerationAndroid
            />
          </View>
        </Modal>

        <View style={{ flex: 1 }}>
          {this.state.cartlist.length == 0 ?
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
              <BlankError text="Your Cart Is Empty." />
            </View>
            :
            <FlatList
              data={this.state.cartlist}
              renderItem={this.renderCartList}
              ListFooterComponent={this._renderFooter}
              style={{ flex: 1 }}
            />}

          {this.state.cartlist.length == 0 ? null :
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text onPress={() => this.RBSheet.open()} style={{ color: BLUE, fontSize: heightPercentageToDP(2.2), marginLeft: 10, marginBottom: 10, fontFamily: 'Roboto-Bold', justifyContent: 'flex-start', alignSelf: 'flex-start', alignItems: 'flex-start', alignContent: 'flex-start' }}>Have a coupon code?</Text>
              <Text onPress={() => this.RBSheet2.open()} style={{ right: 5, color: BLUE, fontSize: heightPercentageToDP(2.2), marginLeft: 10, marginBottom: 10, fontFamily: 'Roboto-Bold', justifyContent: 'flex-end', alignSelf: 'flex-end', alignItems: 'flex-end', alignContent: 'flex-end', }}>Have a referrel code?</Text>
            </View>
          }

          {this.state.cartlist.length == 0 ? null :
            <View style={{ backgroundColor: '#ececec', padding: 5 }}>
              <View style={{ flexDirection: 'row', marginLeft: 5, marginRight: 5, justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ bottom: 2, height: heightPercentageToDP(10), width: widthPercentageToDP(60), borderRadius: 4, bottom: 1, justifyContent: 'flex-start', alignItems: 'flex-start', alignContent: 'flex-start', alignSelf: 'flex-start' }} >
                  <Text style={{ color: 'black', fontSize: heightPercentageToDP(2.5), fontFamily: 'Roboto-Regular', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 6 }} >Total Amount <Text style={{ color: BLUE, fontSize: heightPercentageToDP(2.5), fontFamily: 'Roboto-Bold', justifyContent: 'flex-end', alignItems: 'flex-end' }} >{'\u20B9'}{this.state.cartprice.finalPrice}</Text></Text>
                  <Text style={{ color: 'black', fontSize: heightPercentageToDP(1.5), fontWeight: 'normal', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 4 }} >Total Discount Amount <Text style={{ color: BLUE, fontSize: heightPercentageToDP(1.5), fontFamily: 'Roboto-Regular', justifyContent: 'flex-end', alignItems: 'flex-end' }} > {'\u20B9'}{this.state.cartprice.totalDiscount}</Text></Text>
                  <Text style={{ color: 'black', fontSize: heightPercentageToDP(1.5), fontWeight: 'normal', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 4 }} >Total Referral Discount <Text style={{ color: BLUE, fontSize: heightPercentageToDP(1.5), fontFamily: 'Roboto-Regular', justifyContent: 'flex-end', alignItems: 'flex-end' }} > {'\u20B9'}{this.state.cartprice.totalReferralDiscount}</Text></Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate("Checkout")} style={{ backgroundColor: BLUE, height: heightPercentageToDP(7), width: widthPercentageToDP(35), borderRadius: 4, bottom: 6, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end', alignSelf: 'flex-end' }} >
                    <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} >
                      <Text style={{ color: 'white', fontSize: heightPercentageToDP(2), fontWeight: 'normal', justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: 20 }} >CHECKOUT</Text>
                    </LinearGradient>
                    <AntDesign name="arrowright" size={16} color="white" style={{ marginLeft: 90 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>}

        </View>
        <RBSheet
          ref={ref => {
            this.RBSheet = ref;
          }}
          // height={300}
          openDuration={250}
          height={heightPercentageToDP(80)}
          closeOnDragDown
          dragFromTopOnly
          customStyles={{
            container: {
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10
            }
          }}
        >
          <View style={{ marginLeft: 5, marginRight: 5, marginBottom: 5 }}>
            <Text style={{ justifyContent: 'center', textAlign: 'center', color: 'black', fontFamily: 'Lato-Bold', fontSize: heightPercentageToDP(2) }}>Have a coupon code?</Text>
            <TouchableOpacity style={{ marginTop: 5, backgroundColor: 'transparent', height: heightPercentageToDP(6), width: widthPercentageToDP(100), bottom: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end', alignSelf: 'flex-end' }} >
              <TextInput
                style={{ width: widthPercentageToDP(60), color: 'grey', textAlign: 'center', backgroundColor: "white", borderColor: LIGHTGREY, borderWidth: .8, borderRadius: 4, padding: 10, marginBottom: 0 }}
                placeholder="Enter code here"
                editable={true}
                placeholderTextColor={"grey"}
                defaultValue={this.state.addcoupon}
                onChangeText={(addcoupon) => this.setState({ addcoupon })}
              />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("1")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "1" ? 6 : .4, borderBottomColor: this.state.tab == "1" ? GREEN : "#DCDCDC", padding: 10, paddingTop: this.state.tab == "1" ? 10 : 16 }}>
                <Text style={{ color: this.state.tab == "1" ? "black" : "grey", fontSize: heightPercentageToDP(1.8), fontFamily: 'Lato-Bold', }} >Suggested Coupons</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("2")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "2" ? 6 : .4, borderBottomColor: this.state.tab == "2" ? GREEN : "#DCDCDC", padding: 10, paddingTop: this.state.tab == "2" ? 10 : 16 }}>
                <Text style={{ color: this.state.tab == "2" ? "black" : "grey", fontSize: heightPercentageToDP(1.8), fontFamily: 'Lato-Bold' }}>Applied Coupons</Text>
              </TouchableOpacity>
            </View>
            {this.state.cartprice.suggestedCoupons == undefined ? null :
              <View style={{}} >
                {
                  this.state.tab == "1" ?
                    <View>
                      {this.state.cartprice.suggestedCoupons.length == 0 ?
                        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                          <View>
                            <Image source={require("../../assets/evaluation.png")} style={{ justifyContent: 'center', alignContent: 'center', alignSelf: 'center', textAlign: 'center', height: heightPercentageToDP(8), width: heightPercentageToDP(8), marginTop: 15 }} />
                            <Text style={{ textAlign: 'center', fontSize: heightPercentageToDP(2), color: 'black', marginTop: 10 }}>Suggested Coupon Not Found.</Text>
                          </View>
                        </View>
                        :
                        <FlatList
                          data={this.state.cartprice.suggestedCoupons}
                          renderItem={this.renderSuggestedCoupon}
                          ListFooterComponent={this._renderFooter}
                        //style={{ flex: 1 }}
                        />}
                    </View>
                    :
                    <View>
                    </View>
                }
              </View>
            }

            {this.state.cartprice.suggestedCoupons == undefined ? null :
              <View style={{}} >
                {
                  this.state.tab == "2" ?
                    <View>
                      {this.state.cartprice.appliedCoupons.length == 0 ?
                        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                          <View>
                            <Image source={require("../../assets/evaluation.png")} style={{ justifyContent: 'center', alignContent: 'center', alignSelf: 'center', textAlign: 'center', height: heightPercentageToDP(8), width: heightPercentageToDP(8), marginTop: 15 }} />
                            <Text style={{ textAlign: 'center', fontSize: heightPercentageToDP(2), color: 'black', marginTop: 10 }}>Applied Coupon Not Available</Text>
                          </View>
                        </View>
                        :
                        <FlatList
                          data={this.state.cartprice.appliedCoupons}
                          renderItem={this.renderAppliedCoupon}
                          ListFooterComponent={this._renderFooter}
                        />}
                    </View>
                    :
                    <View>
                    </View>
                }
              </View>
            }

            {/* onPress={() => this.submitCoupon()} */}
          </View>
          {this.state.couponapp ?
            <TouchableOpacity activeOpacity={.7}>
              <LinearGradient colors={[BUTTON_COLOR_1, BUTTON_COLOR_2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', bottom: 20, right: 20, height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2 }} >
                <ActivityIndicator color="white" />
              </LinearGradient>
            </TouchableOpacity> :
            <LinearGradient colors={[BUTTON_COLOR_1, BUTTON_COLOR_2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', bottom: 20, right: 20, height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2 }} >
              <View style={{}} >
                <TouchableOpacity onPress={() => this.submitCoupon()}  >
                  <AntDesign name="arrowright" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>}
        </RBSheet>

        <RBSheet
          ref={ref => {
            this.RBSheet2 = ref;
          }}
          openDuration={250}
          height={heightPercentageToDP(80)}
          closeOnDragDown
          dragFromTopOnly
          customStyles={{
            container: {
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10
            }
          }}
        >

          <View style={{ marginLeft: 5, marginRight: 5, marginBottom: 5 }}>
            <Text style={{ justifyContent: 'center', textAlign: 'center', color: 'black', fontFamily: 'Roboto-Bold', fontSize: heightPercentageToDP(2) }}>Have a referral code?</Text>
            <TouchableOpacity style={{ marginTop: 5, backgroundColor: 'transparent', height: heightPercentageToDP(6), width: widthPercentageToDP(100), bottom: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end', alignSelf: 'flex-end' }} >
              <TextInput
                style={{ width: widthPercentageToDP(60), color: 'grey', textAlign: 'center', backgroundColor: "white", borderColor: LIGHTGREY, borderWidth: .8, borderRadius: 4, padding: 10, marginBottom: 0 }}
                placeholder="Enter code here"
                editable={true}
                placeholderTextColor={"grey"}
                defaultValue={this.state.addreferral}
                onChangeText={(addreferral) => this.setState({ addreferral })}
              />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              {/* <TouchableOpacity activeOpacity={.7} onPress={() => this.handleTab("1")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.tab == "1" ? 6 : .4, borderBottomColor: this.state.tab == "1" ? GREEN : "#DCDCDC", padding: 10, paddingTop: this.state.tab == "1" ? 10 : 16 }}>
                <Text style={{ color: this.state.tab == "1" ? "black" : "grey", fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Bold', }} >Suggested Coupons</Text>
              </TouchableOpacity> */}
              <TouchableOpacity activeOpacity={.7} onPress={() => this.referralhandleTab("2")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: this.state.referraltab == "2" ? 6 : .4, borderBottomColor: this.state.referraltab == "2" ? GREEN : "#DCDCDC", padding: 10, paddingTop: this.state.referraltab == "2" ? 10 : 16 }}>
                <Text style={{ color: this.state.referraltab == "2" ? "black" : "grey", fontSize: heightPercentageToDP(1.8), fontFamily: 'Roboto-Bold' }}>Applied Referral</Text>
              </TouchableOpacity>
            </View>
            {/* {this.state.cartprice.suggestedCoupons == undefined ? null :
              <View style={{}} >
                {
                  this.state.tab == "1" ?
                    <View>
                      {this.state.cartprice.suggestedCoupons.length == 0 ?
                        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                          <View>
                            <Image source={require("../../assets/evaluation.png")} style={{ justifyContent: 'center', alignContent: 'center', alignSelf: 'center', textAlign: 'center', height: heightPercentageToDP(8), width: heightPercentageToDP(8), marginTop: 15 }} />
                            <Text style={{ textAlign: 'center', fontSize: heightPercentageToDP(2), color: 'black', marginTop: 10 }}>Suggested Coupon Not Found.</Text>
                          </View>
                        </View>
                        :
                        <FlatList
                          data={this.state.cartprice.suggestedCoupons}
                          renderItem={this.renderSuggestedCoupon}
                          ListFooterComponent={this._renderFooter}
                        //style={{ flex: 1 }}
                        />}
                    </View>
                    :
                    <View>
                    </View>
                }
              </View>
            } */}

            {this.state.cartprice.appliedReferrals == undefined ? null :
              <View style={{}} >
                {
                  this.state.referraltab == "2" ?
                    <View>
                      {this.state.cartprice.appliedReferrals.length == 0 ?
                        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                          <View>
                            <Image source={require("../../assets/evaluation.png")} style={{ justifyContent: 'center', alignContent: 'center', alignSelf: 'center', textAlign: 'center', height: heightPercentageToDP(8), width: heightPercentageToDP(8), marginTop: 15 }} />
                            <Text style={{ textAlign: 'center', fontSize: heightPercentageToDP(2), color: 'black', marginTop: 10 }}>Applied Referral Not Available</Text>
                          </View>
                        </View>
                        :
                        <FlatList
                          data={this.state.cartprice.appliedReferrals}
                          renderItem={this.renderAppliedReferrel}
                          ListFooterComponent={this._renderFooter}
                        />}
                    </View>
                    :
                    <View>
                    </View>
                }
              </View>
            }
          </View>
          {this.state.referralapp ?
            <TouchableOpacity activeOpacity={.7}>
              <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', bottom: 20, right: 20, height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2 }} >
                <ActivityIndicator color="white" />
              </LinearGradient>
            </TouchableOpacity> :
            <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', bottom: 20, right: 20, height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2 }} >
              <View style={{}} >
                <TouchableOpacity onPress={() => this.submitReferral()}  >
                  <AntDesign name="arrowright" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>}

        </RBSheet>
      </View>
    );
  }
}
