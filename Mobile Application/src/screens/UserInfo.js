import React, { Component } from 'react';
import { View, Text, ImageBackground,Image ,TouchableHighlight,KeyboardAvoidingView,Alert, ScrollView} from 'react-native';
import {ApplicationProvider,Layout,Input,Button} from "@ui-kitten/components"
import { mapping, dark as darkTheme } from '@eva-design/eva';

import { HEIGHT ,WIDTH, GREEN, GREY, BG_COLOR, BLUE} from '../utils/utils';
import { BASE_URL } from '../utils/configs';
import Loader from '../utils/Loader';
import DatePicker from 'react-native-datepicker'
import moment from 'moment';

export default class UserInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Oauth:this.props.navigation.state.params.Oauth,
      user_id:this.props.navigation.state.params.userID,
      institute_name:"",
      year:'',
      address:'',
      city:'',
      state:'',
      zipcode:'',
      dob:'',
      number:'',
      loading:false          
    };
  }


  update  = async () => {
    
    this.setState({loading:true})
    await fetch(`${BASE_URL}/api/v1/users/update`,{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id:this.state.user_id,
        college:this.state.institute_name,
        year:this.state.year,
        address:this.state.address,
        city:this.state.city,
        state:this.state.state,
        zip_code:this.state.zipcode,
        dob:this.state.dob,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
          console.log(res)
          this.setState({loading:false})
          if(res.success){
           this.props.navigation.navigate("Walkthrough",{userID:res.user.id})
          }else{
            alert(res.error)
            console.log(res.error.details)
          }
      }).catch((err) => console.log(err))
}

  
  static navigationOptions={
    header:null
  }
  render() {
    return this.state.loading  ? <Loader /> : (
      <ApplicationProvider
      mapping={mapping}
      theme={darkTheme}
      
      >
     <ImageBackground   style={{width:WIDTH,flex:1,backgroundColor:BG_COLOR}}>
            <ScrollView scrollEnabled={false} style={{width:WIDTH,flex:1,}} >
          <KeyboardAvoidingView behavior="padding" style={{width:WIDTH,flex:1,justifyContent:'center',alignItems:'center'}} >
              <Image source={require("../../assets/splash-min.png")} style={{width:WIDTH,height:100,resizeMode:'contain',marginTop:10}}/>
              {/* <Text style={{fontSize:30,color:'white',fontWeight:'bold',marginTop:10}}></Text> */}
              <Text style={{fontSize:18,color:'lightgrey',fontWeight:'100',marginTop:5}}>Please update your account details</Text>
              <Input
                onChangeText={(address) => this.setState({address})}
                style={{width:WIDTH-30,marginTop:10,backgroundColor:'#606060',height:60}}
                placeholder='Address'
              />

              <Input
                onChangeText={(city) => this.setState({city})}
                style={{width:WIDTH-30,marginTop:10,backgroundColor:'#606060',height:60}}
                placeholder='City'
              />

              <Input
              onChangeText={(state) => this.setState({state})}
                style={{width:WIDTH-30,marginTop:10,backgroundColor:'#606060',height:60}}
                placeholder='State'
              />
           

              <Input
                onChangeText={(zipcode) => this.setState({zipcode})}
                keyboardType="number-pad"
                style={{width:WIDTH-30,marginTop:10,backgroundColor:'#606060',height:60}}
                placeholder="Pincode"
              />
         
              <Input
                onChangeText={(institute_name) => this.setState({institute_name})}
                style={{width:WIDTH-30,marginTop:10,backgroundColor:'#606060',height:60}}
                placeholder="Institute"
              />
            
             <Input
                keyboardType="number-pad"
                onChangeText={(year) => this.setState({year})}
                style={{width:WIDTH-30,marginTop:10,backgroundColor:'#606060',height:60}}
                placeholder="Batch Year"
              />  
              <View style={{justifyContent:'center',alignItems:'center'}}>
              <Input
                keyboardType="number-pad"
                value={this.state.dob}
                onChangeText={(dob) => this.setState({dob})}
                style={{width:WIDTH-30,marginTop:10,backgroundColor:'#606060',height:60}}
                placeholder="DOB"
              />
               <DatePicker
                    style={{width: WIDTH,position: "absolute",top:0,left:0,right:0,bottom:0,height:80,opacity:0}}
                    date={this.state.dob}
                    mode="date"
                    placeholder="select date"
                    format="DD-MM-YYYY"
                    minDate="01-01-1980"
                    maxDate={moment().format("DD-MM-YYYY")}
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    customStyles={{}}
                  onDateChange={(date) => {this.setState({dob: date})}}
                  />  
            </View>

            

                    {/* <Text onPress={() => this.props.navigation.navigate("ForgotPassword")} style={{fontSize:14,color:'grey',fontWeight:'bold',marginTop:10,paddingLeft:180}}>Forgot PassWord ?</Text> */}

        <TouchableHighlight onPress={this.update} style={{backgroundColor:BLUE,width:WIDTH-30,height:60,justifyContent:'center',alignItems:'center',borderRadius:5,marginTop:10}}>
            <Text style={{color:GREY,fontWeight:'bold',fontSize:18}}>NEXT</Text>
     </TouchableHighlight>


         </KeyboardAvoidingView>
         </ScrollView>
          </ImageBackground>
        


        

      </ApplicationProvider>
    );
  }
}
