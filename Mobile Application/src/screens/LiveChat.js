import React, { Component, useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import io from "socket.io-client"
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { Avatar } from 'react-native-paper';
import { BASE_URL } from '../utils/configs';
import { WIDTH, LIGHTGREY, GREY, GRAD1 } from '../utils/utils';
import moment from "moment"
import BlankError from '../utils/BlankError';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ENDPOINT = BASE_URL


export default class LiveChat extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      message: '',
      messages: []
    };

  }

  componentDidMount() {
    this.socket = io(`${BASE_URL}`, {
      transports: ['websocket'],
    });

    // console.log(this.props.eventID)
    this.socket.on('connect', () => {
      this.socket.on("message.chat", (res) => {
        this.setState({
          messages: res,
        });
      })

    })


  }


  renderData = ({ item, index }) => {
    return (<View style={{ margin: heightPercentageToDP(1.5), alignItems: 'center', flexDirection: 'row' }} >
      <Avatar.Text label={item.user_first_name.slice(0, 1)} size={heightPercentageToDP(3)} />
      <View style={{ margin: 5, justifyContent: 'center' }}>
        <Text style={{ color: LIGHTGREY, color: LIGHTGREY, fontSize: 10, width: widthPercentageToDP(65) }}>{item.user_first_name}</Text>
        <Text style={{ color: LIGHTGREY, }} >{item.comment}</Text>
      </View>
      <Text style={{ color: LIGHTGREY, fontSize: 10 }} >{moment(item.created_at).fromNow()}</Text>
    </View>)
  }

  render() {


    const onSubmit = () => {

      console.log(this.props.token)
      const object = JSON.stringify({
        event_id: this.props.eventID,
        token: this.props.token
      })

      const msgObject = {
        event_id: this.props.eventID,
        comment: this.state.message,
      }

      console.log(msgObject)


      this.socket.emit('message.base', object)


      this.socket.emit('message.chat', msgObject)
      this.textInput.clear()
      this.componentDidMount()
      // this.setState({
      //   messages:[...this.state.message,msgObject]
      // })

      console.log(this.state.message)
    }

    return (

      <View style={{ flex: 1 }}>
        <View
          style={{ flex: 1, width: WIDTH }}          
          >
          {this.state.messages.length == 0
            ?
            <BlankError text={"Chats not available"} />
            :
            <FlatList
             ref={ref => { this.scrollView = ref }}
              style={{ flex: 1 ,marginBottom:heightPercentageToDP(6)}}
              data={this.state.messages}
              renderItem={this.renderData}
              extraData={this.state}
              onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}
            />
          }
        </View>
        <View style={{ position: 'absolute', bottom: 0, flexDirection: 'row', height: 60, backgroundColor: "white", left: 0, right: 0, borderTopColor: LIGHTGREY, borderTopWidth: .5, padding: 5, flex: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
          <TextInput
            ref={input => { this.textInput = input }}
            style={{ backgroundColor: "#ececec", color: LIGHTGREY, fontSize: 10, height: 40, borderRadius: 5, flex: 1 }}
            onChangeText={(message) => this.setState({ message })}
            placeholder={' Write your Comment here'}
            placeholderTextColor={LIGHTGREY}
            underlineColorAndroid={'transparent'}
            onSubmitEditing={onSubmit}
          />
          {
            <TouchableOpacity onPress={onSubmit} style={{ justifyContent: 'center', alignItems: 'center', margin: 10 }}>

              <Ionicons name="md-send" size={35} color={LIGHTGREY} />

            </TouchableOpacity>
          }
        </View>
      </View>
    );
  }
}




