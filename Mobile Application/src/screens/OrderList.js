import React, { Component } from 'react';
import { View, AsyncStorage, FlatList, Image, TouchableOpacity, Alert, TextInput, BackHandler } from 'react-native';
import { styles, Header, LIGHTGREY, BLUE, WIDTH } from '../utils/utils';
import { fetchNotifications, fetchOrderList, removeFromCart, applyCoupon } from '../utils/configs';
import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import OrderHeading from '../utils/OrderHeading';
import Loader from '../utils/Loader';
import BlankError from '../utils/BlankError';
import { Block, Icon } from 'galio-framework';
import moment from "moment";
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import OrderListComponent from './components/OrderListComponent';
import Text from './components/CustomFontComponent'

export default class OrderList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderlist: [],
      loading: true,
      coupon: ''
    };
  }

  async componentDidMount() {
    AsyncStorage.getItem("user_id").then(id => {
      AsyncStorage.getItem("user_token").then(token => {
        fetchOrderList(token).then(data => {
          //console.log("ORDER LIST VALUE")
          //console.log(data)
          if (data.success) {
            this.setState({
              orderlist: data.orders,
              loading: false
            })
            //console.log("ORDERS LISTING")
            //console.log(this.state.orderlist)
          }
        })
      })
    })
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
        <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title="Order List" />
        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: heightPercentageToDP(2.5), color: BLUE, margin: 10 }}>Your Orders </Text>
          <Text style={{ fontSize: heightPercentageToDP(2), color: LIGHTGREY, margin: 10 }}>({this.state.orderlist.length}) Item</Text>
        </View> */}
        <View style={{ flex: 1 }}>
        {/* <View style={{flexDirection:'row', justifyContent:'space-around', marginTop:10, }}>
            <Text style={{color:'black', fontSize:16, textAlign:'justify',}}>Order ID</Text>
            <Text style={{color:'black', fontSize:16, textAlign:'justify',}}>Course</Text>
            <Text style={{color:'black', fontSize:16, textAlign:'justify',}}>Status</Text>
            <Text style={{color:'black', fontSize:16, textAlign:'justify',}}>Price</Text>
            <Text style={{color:'black', fontSize:16, textAlign:'justify',}}>Invoice</Text>
          </View> */}
              <View style={{ width: WIDTH }} >
                {this.state.orderlist.length == 0 ?
            <View style={{ flex: 1, justifyContent: 'center',  marginTop:200, alignItems: 'center', }}>
              <BlankError text="Your Order List Is Empty." />
            </View>
            :
                <FlatList
                  data={this.state.orderlist}
                  //ListFooterComponent={this._renderView}
                  renderItem={({ item, index }) => {
                    return (
                      <View>
                        {/* {item.carts.length == 0 ? null :
                          <OrderHeading style={{ fontSize: heightPercentageToDP(2), marginLeft:30, }} text={"ODR# " + item.order_id} />
                        } */}
                        {item.carts.length == 0  ? null :
                          <OrderListComponent navigationHome="OrderDetail" navigation={this.props.navigation} data={item.carts} />
                        }
                      </View>
                    )
                  }}
                />}
              </View>
        </View>
      </View>
    );
  }
}
