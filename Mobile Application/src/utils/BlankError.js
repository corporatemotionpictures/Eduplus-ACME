import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import { GREY, HEIGHT, LIGHTGREY } from './utils';
import LottieView from "lottie-react-native";


export default class BlankError extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
        <View style={{flex:1,justifyContent:'center',alignItems:'center',}}>
            <LottieView
              autoPlay
              source={require("./OTSLoaderTest.json")}
              style={{height:200,width:200}}
            />
            <Text style={{color:LIGHTGREY,fontSize:20,textAlign:'center',marginTop:20, fontFamily:'Roboto-Regular'}}>{this.props.text}</Text>
            <Text style={{color:LIGHTGREY,fontSize:16,textAlign:'center',marginTop:10, fontFamily:'Roboto-Regular'}}>{this.props.text2}</Text>
            {/* <Image source={require("../../assets/logosquare.png")} style={{width:100,height:100,opacity: .2,resizeMode:'contain'}} /> */}
      </View>
    );
  }
}
