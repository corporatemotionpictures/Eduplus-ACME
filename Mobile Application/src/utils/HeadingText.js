import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LIGHTGREY, GREY, BG_COLOR, LIGHT_BLUE } from './utils';

export default class HeadingText extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <View style={{padding:10}}>
        <Text style={{color:"#000",fontSize:hp(1.5),fontWeight:'100', fontFamily:'Roboto-Regular', fontWeight: 'bold', marginLeft: hp(1.1), marginTop: hp(0.9)}}>{this.props.text}</Text>
      </View>
    );
  }
}
