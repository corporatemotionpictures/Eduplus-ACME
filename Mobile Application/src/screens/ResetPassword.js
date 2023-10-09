import React, { Component } from 'react';
import { View, Text ,TouchableHighlight, AsyncStorage,Alert} from 'react-native';
import OtpInputs from "react-native-otp-inputs";
import { styles, BG_COLOR, WIDTH, GREEN, HEIGHT } from '../utils/utils';
import { BASE_URL} from "../utils/configs"
import { Input ,ApplicationProvider,Layout,Button,} from '@ui-kitten/components';

import { mapping, dark as darkTheme } from '@eva-design/eva';


export default class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
        otp:'',
        user_id:this.props.navigation.state.params.userID,
        password:'',
        confirm_password:''
    };
  }

  
  verifyUser =  () => { 
      console.log(this.state.user_id)
      console.log(this.state.otp)
      console.log(this.state.password)
      console.log(this.state.confirm_password)
  
        fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
                ver_code:this.state.otp,
                id:this.state.user_id,
                password:this.state.password,
                confirm_password:this.state.confirm_password,
          })
        })
            .then((res) => res.json())
            .then((res) => {
          if(res.success)
          {
            console.log(res)
            alert("Your Password is Reset")
            this.props.navigation.navigate('Login');
                
          }
          else{
              console.log(res)
            Alert.alert("Error");
          }
    
        })
        .catch((error) => {
                //console.error(error);
              });
          }
      
  render() {
    return (
        <ApplicationProvider
        mapping={mapping}
        theme={darkTheme}
        >
          <Layout style={{flex:1,height:HEIGHT}}>
  
      <View style={[styles.BG_STYLE,{backgroundColor:BG_COLOR,justifyContent:'center',alignItems:'center',}]}>
          <Text style={{color:'white'}}>Wait for the OTP</Text>
             <Input
                style={{width:WIDTH-30,marginTop:20,backgroundColor:'#606060',height:60}}
                placeholder='Password'
                onChangeText={(password) => this.setState({password})}
              />
              <Input
                style={{width:WIDTH-30,marginTop:20,backgroundColor:'#606060',height:60}}
                placeholder='Confirm Password'
                onChangeText={(confirm_password) => this.setState({confirm_password})}
              />
                <OtpInputs
                style={{flexDirection:'row',marginBottom:10}}
                handleChange={otp => this.setState({otp})}
                numberOfInputs={4}
                />

        <TouchableHighlight onPress={this.verifyUser}  style={{height:20,width:200,justifyContent:'center',alignItems:'center',backgroundColor:GREEN,padding:20,margin:20}}><Text style={{fontSize:15,color:'white',fontWeight:'100'}}>Verify</Text></TouchableHighlight>
      </View>
      </Layout>
      </ApplicationProvider>
    );
  }
}
