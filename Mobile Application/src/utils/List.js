import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { HEIGHT, WIDTH, GREY, LIGHTGREY, LIGHT_GREY, BLUE } from './utils';
import { Ionicons } from "@expo/vector-icons"
import { BASE_URL } from './configs';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';


export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAnswer: this.props.subtitle  
    };
  }


  handleChange = () =>{
      this.setState({
        showAnswer:!this.state.showAnswer
      })
  } 

  render() {

    const list = this.props.listType == "videoList" ?
      (
        <TouchableOpacity onPress={this.props.onPress} style={{ justifyContent: 'flex-start', alignItems: 'center', alignSelf: 'flex-start', width: WIDTH, padding: 10, flexDirection: 'row', borderBottomColor: LIGHTGREY, borderBottomWidth: .5 }} >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
            {
              this.props.circularThumbnail ?
                <Image source={{ uri: `${BASE_URL}${this.props.data.thumbnail}` }} style={{ width: 60, height: 60, borderRadius:30 }} /> :
                <Image source={{ uri: `${BASE_URL}${this.props.data.thumbnail}` }} style={{ width: 90, height: 60, }} />
            }
            <Text style={{ color: 'grey', fontSize: 14, paddingLeft: 15, padding: 10, textAlign: 'left' ,width:200}}>{this.props.data.title ? this.props.data.title  : this.props.data.name}</Text>
          </View>
          {this.props.rightIcon != null ? <View style={{ alignItems: 'center', position: 'absolute', right: 27 }}><Ionicons name={this.props.rightIcon} size={28} color="grey" /></View> : null}

        </TouchableOpacity>
      ) :
      (
        <TouchableOpacity onPress={this.props.onPress} style={{ width: WIDTH, padding: 10, justifyContent: 'space-evenly', borderBottomColor: "#DCDCDC", borderBottomWidth: .5 }} >

      <Text style={{ color: '#393939', fontSize:heightPercentageToDP(2), fontFamily:'Roboto-Bold' }}>{this.props.data.question}</Text>
          
         {
            this.props.subtitle 
            ? 
          <View style={{flexDirection:'row',alignItems:'center',}}>
            <Text style={{ color: this.props.lightMode ? "black" : 'black', fontSize:heightPercentageToDP(1.7),padding:5, flex:1, fontFamily:'Roboto-Regular', textAlign:'justify', width:widthPercentageToDP(95) }}>{this.props.subtitle ? this.props.data.answer : null}</Text>
          </View> : 
         <TouchableOpacity  onPress={this.handleChange} style={{flexDirection:'row',alignItems:'center',}}>
            {/* <Ionicons  name="md-eye" size={20} color={this.props.lightMode ? LIGHT_GREY : 'grey'} /> */}
            <Text style={{ color: this.props.lightMode ? "black" : 'black', flex: 1,padding:5, fontSize: heightPercentageToDP(1.7), fontFamily: 'Roboto-Regular', textAlign:'justify', width:widthPercentageToDP(95) }}>{this.state.showAnswer ? this.props.data.answer :"View Answer" }</Text>
         </TouchableOpacity>
          }
        </TouchableOpacity>
      );
    return list;
  }
}
