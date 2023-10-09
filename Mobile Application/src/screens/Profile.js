import React from "react";
import {createStackNavigator}  from "react-navigation-stack";
import {createAppContainer} from "react-navigation";
import Detail from "./Profile/Detail";
import Settings from "./Profile/Settings";
import RaiseTicket from "./RaiseTicket";
import TicketDiscussArea from "./TicketDiscussArea";
import CreateTicket from "./CreateTicket";
import CartList from './CartList';
import OrderList from './OrderList';
import OrderDetail from './OrderDetail';
import ReferAndEarn from './ReferAndEarn';


const Profile = createStackNavigator({
  Detail:{
    screen:Detail,
    navigationOptions:{
      header:null
    }
  },
  Settings:{
    screen:Settings,
    navigationOptions:{
      header:null
    }
  },
  RaiseTicket:{
    screen:RaiseTicket,
    navigationOptions:{
      header:null
    }
  },
  TicketDiscussArea:{
    screen:TicketDiscussArea,
    navigationOptions:{
      header:null
    }
  },
  CreateTicket:{
    screen:CreateTicket,
    navigationOptions:{
      header:null
    }
  },
  CartList: {
    screen: CartList,
    navigationOptions: {
      header: null
    }
  },

  OrderList: {
    screen: OrderList,
    navigationOptions: {
      header: null
    }
  },
  ReferAndEarn: {
    screen: ReferAndEarn,
    navigationOptions: {
      header: null
    }
  },
  OrderDetail: {
    screen: OrderDetail,
    navigationOptions: {
      header: null
    }
  },

})

export default createAppContainer(Profile)