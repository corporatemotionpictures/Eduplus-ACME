import React, { Component } from 'react';
import { View, Text,Image } from 'react-native';
import { BG_COLOR, styles, GREY, LIGHTGREY, BLUE } from './utils';
import LottieView from 'lottie-react-native';

export default class OTSLoader extends Component {
  constructor(props) {
    super(props); 
    this.state = {
    };
  }

  render() {
    return (
      <View style={{backgroundColor:BLUE,justifyContent:'center',alignItems:'center',flex:1}}>
        <LottieView 
        autoPlay
        source={require("./OTSLoaderanimation.json")}
        style={{height:200,width:200,}}
        />
        {/* <View style={{position:'absolute',top:0,left:0,bottom:0,right:0,justifyContent:'center',alignItems:'center'}}>
                <Image source={require("../../assets/icon.png")} style={{width:40,height:40}} />
        </View> */}
        <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,justifyContent:'center',alignItems:'center'}}>
            <Text style={{color:"white",marginTop:200}}> Starting Online Test</Text>
            <Text style={{color:"white"}}>Analyzing your Strengths and Weaknesses  </Text>
        </View>
      </View>
    );
  }
}
