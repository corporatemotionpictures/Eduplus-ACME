import React, { Component } from 'react';
import { View, Text } from 'react-native';



export default class QuoteLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
        quotes:[
            "Beli Chi Nagin Nigali Hoye Hoye,\n Munna Bhai Dola Ya lagla. ",
            "Bhai ne Bola Karne ka to karne ka",
            "Beli Chi Nagin Nigali Hoye Hoye,\n Munna Bhai Dola Ya lagla. ",
            "Bhai ne Bola Karne ka to karne ka",
            "Beli Chi Nagin Nigali Hoye Hoye,\n Munna Bhai Dola Ya lagla. ",
            "Bhai ne Bola Karne ka to karne ka",
            "Beli Chi Nagin Nigali Hoye Hoye,\n Munna Bhai Dola Ya lagla. ",
            "Bhai ne Bola Karne ka to karne ka",
            
            
        ]
    };
  }


  render() {

    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center',}}>
                <Text style={{fontSize:20,color:'white'}}>{this.state.quotes[Math.round(Math.random())]}</Text>
      </View>
    );
  }
}
