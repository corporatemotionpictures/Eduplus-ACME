import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { LIGHTGREY, GREY, BG_COLOR, LIGHT_BLUE } from './utils';

export default class OrderHeading extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <View style={{padding:8,}}>
        <Text style={{color:"#07a1e8",fontSize:16,fontWeight:'100'}}> {this.props.text} </Text>
      </View>
    );
  }
}
