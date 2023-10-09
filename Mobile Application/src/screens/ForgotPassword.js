import React, { Component } from 'react';
import { View, Text, ImageBackground,Image ,TouchableHighlight,KeyboardAvoidingView,Dimensions,StyleSheet,Animated} from 'react-native';
import {ApplicationProvider,Layout,Input,Button,} from "@ui-kitten/components"
import { mapping, dark as darkTheme } from '@eva-design/eva';

import { HEIGHT ,WIDTH, GREEN, GREY} from '../utils/utils';
import { BASE_URL } from '../utils/configs';


export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobile_number:''
    };
  }

  
  sendOTP  = async () => {
    await fetch(`${BASE_URL}/api/v1/auth/forgot-password`,{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile_number:this.state.mobile_number
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
          if(res.success){
                alert("OTP has been send to your Phone number");
                this.props.navigation.navigate("ResetPassword",{userID:res.user.id})
          }else{
            alert("Number is Invalid")
          }
      }).catch((err) => console.log(err))
}


  
  static navigationOptions={
    header:null
  }
  render() {
    return (
      <ApplicationProvider
      mapping={mapping}
      theme={darkTheme}
      
      >
        <Layout style={{flex:1,height:HEIGHT}}>

  {/* <ImageBackground source={require("../../assets/Background.jpg")} style={{width:WIDTH,height:HEIGHT,flex:1,}}> */}
  <KeyboardAvoidingView style={{width:WIDTH,height:HEIGHT,flex:1,alignItems:'center'}} >
              <Image source={require("../../assets/splash-min.png")} style={{width:WIDTH,height:100,resizeMode:'contain',marginTop:40}}/>

              <Text style={{fontSize:30,color:'white',fontWeight:'bold',marginTop:20}}>Forgot Password</Text>
              <Text style={{fontSize:18,color:'lightgrey',fontWeight:'100',marginTop:20}}></Text>

              <Input
                autoFocus
                onChangeText={(mobile_number) => this.setState({mobile_number})}
                style={{width:WIDTH-30,marginTop:20,backgroundColor:'#606060',height:60}}
                placeholder='Mobile Number'
              />
                    {/* <Text onPress={() => this.props.navigation.navigate("ForgotPassword")} style={{fontSize:14,color:'grey',fontWeight:'bold',marginTop:10,paddingLeft:180}}>Forgot PassWord ?</Text> */}

                    <TouchableHighlight onPress={this.sendOTP} style={{backgroundColor:'#669900',width:WIDTH-30,height:60,justifyContent:'center',alignItems:'center',borderRadius:5,marginTop:30}}>
            <Text style={{color:GREY,fontWeight:'bold',fontSize:18}}>SEND</Text>
          </TouchableHighlight>
              
          <Text style={{fontSize:18,color:'lightgrey',fontWeight:'100',marginTop:20}}>Check your inbox for OTP</Text>
            {/* <TouchableHighlight onPress={() =>this.props.navigation.navigate("SignUp")}  style={{height:40,width:WIDTH,position:'absolute',bottom:10,left:0,right:0,justifyContent:'center',alignItems:'center'}}><Text style={{fontSize:18,color:'white',fontWeight:'100'}}>don't have an account? Sign Up</Text></TouchableHighlight> */}
          </KeyboardAvoidingView>
        
          {/* </ImageBackground> */}
         
          
        </Layout>

        

      </ApplicationProvider>
    );
  }
}
