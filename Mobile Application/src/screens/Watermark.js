import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { WIDTH } from '../utils/utils';

export default class Watermark extends Component {
  constructor(props) {
    super(props);
    this.state = {
        top:10,
        bottom:10,
        left:10,
        right:10
    };
  }

  replace = () =>{
    this.setState({
        top:(Math.random()*100),
        bottom:(Math.random()*100),
        left:(Math.random()*200),
        right:(Math.random()*200),

    })
  }

  componentDidMount(){
      setInterval(() =>{
        this.replace()
      },9000)
  }

  render() {
    return (
        <View style={{justifyContent:'center',alignItems:'center',position:'absolute',}}>
                <Text style={{color:"rgba(0,0,0,0.4)",fontWeight:'bold',fontSize:20,width:WIDTH,opacity:.2,marginTop:this.state.top,left:this.state.left,right:this.state.right,bottom:this.state.bottom,}} > {this.props.watermarkText} </Text>
        </View>
    );
  }
}
