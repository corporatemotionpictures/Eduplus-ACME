import React, { Component } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, AsyncStorage } from 'react-native';
import { styles, Header, LIGHTGREY, GREEN } from '../utils/utils';
import { Ionicons } from "@expo/vector-icons";
import { fetchSingleTicket, BASE_URL } from '../utils/configs';
import moment from "moment"
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';


export default class TicketDiscussArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tickets: [],
      item: this.props.navigation.state.params.item
    };

    console.log(this.state.item.id)
  }


  componentDidMount() {
    AsyncStorage.getItem("user_token").then(token => {
      fetchSingleTicket(token, this.state.item.id).then(data => {
        this.setState({
          tickets: data.raiseTicket,
          ticket: data.ticket
        })
        console.log(this.state.ticket)
      })
    })
  }

  renderTickets = ({ item, index }) => {
    return (
      // <TouchableOpacity style={{ margin: 10, borderBottomColor: LIGHTGREY, borderBottomWidth: .5, flexDirection: 'row', }} >
      //   <View style={{ flexDirection: 'row', }}>
      //     {item.ticket_type != "QUERY" ?
      //       <Image source={require("../../assets/icon.png")} style={{ width: 30, height: 30, borderRadius: 20, margin: 5 }} />
      //       :
      //       <Image source={{ uri: `${BASE_URL}${item.user_image}` }} style={{ width: 30, height: 30, borderRadius: 20, backgroundColor: LIGHTGREY, margin: 5 }} />
      //     }
      //     <Text numberOfLines={4} style={{ color: 'grey', fontSize: 15, width: 280, margin: 5 }}> {item.message}</Text>
      //     <Text style={{ color: 'grey', fontSize: 10, margin: 5, alignItems: 'center' }}>{moment(item.created_at).format("DD/MMM/yyy")}</Text>
      //   </View>
      //   <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', paddingBottom: 15 }}>
      //   </View>
      // </TouchableOpacity>
      <View>
        {item.ticket_type == "RESPONSE" ? 
        <View style={{ flexDirection: 'row', padding: heightPercentageToDP(1.6), backgroundColor: '#ffffff' }}>
          {item.user_image == null ? 
          <Image source={require("../../assets/icon.png")} style={{ width: 30, height: 30, borderRadius: 20, margin: 5 }} />
          :
          <Image source={{ uri: `${BASE_URL}${item.user_image}` }} style={{ width: 20, height: 20, borderRadius: 10 }} />
          }          
        <View style={{ marginHorizontal: heightPercentageToDP(1), marginLeft: 10, }} >
          <Text numberOfLines={4} style={{ fontSize: heightPercentageToDP(1.5), fontFamily: 'Roboto-Regular', width: widthPercentageToDP(85), color: '#393939', textAlign: 'justify' }} >{item.message}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: widthPercentageToDP(90), marginTop: heightPercentageToDP(.5) }} >
            <Text style={{ color: 'lightgrey', fontSize: heightPercentageToDP(1.4), marginRight: 20 }}>{moment(item.created_at).fromNow()}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            </View>
          </View>
        </View>
      </View>
      :
      <View style={{ flexDirection: 'row', padding: heightPercentageToDP(1.6), backgroundColor: '#ffffff' }}>
          <Image source={require("../../assets/comment.png")} style={{ width: widthPercentageToDP(9), height: widthPercentageToDP(9), marginTop: heightPercentageToDP(1) }} />
          <View style={{ marginHorizontal: heightPercentageToDP(1), marginLeft: 10, }} >
            <Text numberOfLines={4} style={{ fontSize: heightPercentageToDP(2), fontFamily: 'Roboto-Bold', width: widthPercentageToDP(78), color: '#393939', textAlign: 'justify' }} >{item.message}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: widthPercentageToDP(90), marginTop: heightPercentageToDP(.5) }} >
              <Text style={{ color: 'lightgrey', fontSize: heightPercentageToDP(1.4), marginRight: 20 }}>{moment(item.created_at).fromNow()}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', }}>
              </View>
            </View>
          </View>
        </View>
      }
      </View>
    )
  }


  render() {


    return (
      <View style={styles.BG_STYLE}>
        <Header title={"Raise Ticket"} backIcon={true} onbackIconPress={() => this.props.navigation.goBack()} />
        
        <View style={{ flex: 1 }}>
          <FlatList
            data={this.state.tickets}
            renderItem={this.renderTickets}
          />
        </View>
        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', bottom: 10, left: 0, right: 0 }}>

        </View>
      </View>
    );
  }
}
