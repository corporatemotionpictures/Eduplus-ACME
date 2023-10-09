import React, { Component } from 'react';
import { View, Text } from 'react-native';
import {LinearGradient} from "expo-linear-gradient"
import { GRAD1, GRAD2, HEIGHT, WIDTH, BG_COLOR } from './utils';

export default class Background extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
        <LinearGradient colors={['white',"white"]}  
        style={{
          height:HEIGHT,
          flex:1,
          position:'absolute',
          top:0,
          left:0,
          right:0,
          left:0
        }}
        start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }}>
        </LinearGradient>
    );
  }
}
