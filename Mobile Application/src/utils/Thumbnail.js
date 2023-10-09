import React, { Component } from 'react';
import { View, Text,Image, TouchableOpacity, StatusBar } from 'react-native';
import { WIDTH, GREEN } from './utils';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from './configs';
import {Ionicons} from "@expo/vector-icons"
export default class Thumbnail extends Component {
  constructor(props) {
    super(props);
    this.state = {
        size :this.props.small ? 200 : WIDTH - 30,
        fontWeight:'200'
    };
  }

  render() {
    return this.props.small ? (
           !this.props.data.locked ?  <View style={{flex:1,height: this.props.height ? this.props.height : 160,width: this.props.width ? this.props.width : 180 ,borderRadius:10,margin:10,overflow:'hidden',paddingTop:0,}}>
             {/* <Text>{this.props.data.author}</Text> */}
             <TouchableOpacity  onPress={this.props.onPress} style={{flex:1,height:160,width: 170,borderRadius:10,overflow:'hidden',paddingTop:0,}}>
                    <Image source={{uri:`${BASE_URL}${this.props.data.thumbnail}`}} style={{width:this.props.width ?  this.props.width : 180  ,height:this.props.small ? 160 : 180,}} />
              {/* <Text style={{position:'absolute',left:5,bottom:5,backgroundColor:GREEN,color:'white',fontWeight:'bold',paddingLeft:20,paddingRight:20,borderRadius:10}}>FREE</Text> */}
                <LinearGradient colors={[ 'transparent','rgba(0,0,0,0.8)',]} style={{flex:1,position:'absolute',top:0,bottom:0,left:0,right:0,justifyContent:'flex-end',alignItems:'flex-start',height:200,width:180}} >
                  <Text  numberOfLines={2} style={{color:'white',fontSize:this.props.fontSize ? this.props.fontSize : 18,margin:20,width:this.props.small ? 130 : 200,position:'absolute',bottom:30,fontFamily:'Roboto-Bold'}}>
                    {
                      this.props.data.name ? this.props.data.name : this.props.data.title 
                    }
                    </Text>
                </LinearGradient>
              </TouchableOpacity>
      </View> : <View style={{flex:1,height: this.props.height ? this.props.height : 160,width: this.props.width ? this.props.width : 180 ,borderRadius:10,margin:10,overflow:'hidden',paddingTop:0,}}>
             {/* <Text>{this.props.data.author}</Text> */}
             <TouchableOpacity  onPress={this.props.onPress} style={{flex:1,height:160,width: 170,borderRadius:10,overflow:'hidden',paddingTop:0,}}>
                    <Image source={{uri:`${BASE_URL}${this.props.data.thumbnail}`}} style={{width:this.props.width ?  this.props.width : 180  ,height:this.props.small ? 160 : 180,}} />
              {/* <Text style={{position:'absolute',left:5,bottom:5,backgroundColor:GREEN,color:'white',fontWeight:'bold',paddingLeft:20,paddingRight:20,borderRadius:10}}>FREE</Text> */}
                <LinearGradient colors={[ 'transparent','rgba(0,0,0,0.8)',]} style={{flex:1,position:'absolute',top:0,bottom:0,left:0,right:0,justifyContent:'flex-end',alignItems:'flex-start',height:200,width:180}} >
                  <Text  numberOfLines={2} style={{color:'white',fontSize:this.props.fontSize ? this.props.fontSize : 18,margin:10,width:this.props.small ? 130 : 200,position:'absolute',bottom:30}}>
                    {
                      this.props.data.name ? this.props.data.name : this.props.data.title 
                    }
                    </Text>
                </LinearGradient>
                <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                 <Ionicons name="md-lock" size={50} color="white" />
              {/* <Image source={require("../../assets/play-button-min.png")} style={{width:40,height:40,resizeMode:'contain'}} /> */}
            </View>
              </TouchableOpacity>
      </View> 
    ):(
      <View style={{flex:1,height:this.props.small ? 160 : 180,width: this.props.small  ? 180 :  this.state.size,borderRadius:10,margin:10,overflow:'hidden',paddingTop:0}}>
             {/* <Text>{this.props.data.author}</Text> */}
             <TouchableOpacity onPress={this.props.onPress}>
                    <Image source={{uri:`${BASE_URL}${this.props.data.thumbnail}`}} style={{width:this.state.size,height:this.props.small ? 160 : 180}} />
              {/* <Text style={{position:'absolute',left:5,bottom:5,backgroundColor:GREEN,color:'white',fontWeight:'bold',paddingLeft:20,paddingRight:20,borderRadius:10}}>FREE</Text> */}
                <LinearGradient colors={['transparent','rgba(0,0,0,0.8)']} style={{flex:1,position:'absolute',top:0,bottom:0,left:0,right:0,justifyContent:'flex-end',alignItems:'flex-start',height:200}} >
                  <Text  numberOfLines={2} style={{fontWeight:this.state.fontWeight,color:'white',fontSize:this.props.small ? 20 :30,margin:20,width:this.props.small ? 130 : 200}}>
                    {
                     this.props.data.name ? this.props.data.name : this.props.data.title 
                    }
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
             
      </View>
    );
  }
}
