import React, { Component } from 'react';
import { View, Text ,Image, TouchableOpacity, Alert,ScrollView,Switch, TextInput, KeyboardAvoidingView, AsyncStorage,Platform} from 'react-native';
import { styles, Header, GREY, LIGHTGREY, LIGHT_GREY, WIDTH, BG_COLOR, GREEN } from '../../utils/utils';
import {Ionicons,AntDesign} from "@expo/vector-icons"
import { BASE_URL } from '../../utils/configs';
import ImagePicker from "react-native-image-picker"
import Background from '../../utils/Background';


let options = {
  title: 'Select Image',
  storageOptions: {
    skipBackup: true,
    path: 'images',
    quality:.4
  },
};

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name:'',
      last_name:'',
      institute_name:'',
      year:'',
      address:'',
      city:'',
      state:'',
      zipcode:'',
      dob:''     ,
      user_id:this.props.navigation.state.params.user_id,
      filePath: "",
      fileData: null,
      fileUri: "",
      fileName:"",
      fileType:"",    
      profile:null,
    };
  }

  componentWillMount(){
    const {first_name,last_name,year,dob,college,address,city,state,zip_code,image} = this.props.navigation.state.params.userDetails
    this.setState({
      first_name:first_name,
      last_name:last_name,
      year:year,
      dob:dob,
      city:city,
      state:state,
      zipcode:zip_code,
      institute_name:college,
      address:address,
      profile:image,
    })
  }

  
  
  chooseImage = async () =>{     
  
    await ImagePicker.showImagePicker({options}, (response) => {
                console.log('Response = ', response);
                if (response.didCancel) {
                console.log('User cancelled image picker');
                } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
                } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
                } else {
                const source = { uri: response.uri };
                console.log(source)
                this.setState({
                  filePath: response,
                  fileData: response.data,
                  fileUri: response.uri,
                  fileName:response.fileName,
                  fileType:response.type
                });
          }
    });
    
  }
 
createFormData = () => {
  var data = new FormData(); 
    data.append("file", {
    name: this.state.fileName,
    type: this.state.fileType,
    uri: Platform.OS === "android" ? this.state.fileUri : this.state.fileUri.replace("file://", "")
   });
  console.log(data)
  return data;
};

handleUploadPhoto = () => {
  AsyncStorage.getItem("user_id").then((user_id) =>{
    AsyncStorage.getItem("user_token").then((token) =>{
      fetch(`${BASE_URL}/api/v1/upload?field=users&&id=${user_id}`, {
          method: "POST",
          headers:{
              'X-AUTH-TOKEN':token
          },
          body: this.createFormData(),
      })
          .then(response => response.json())
          .then(response => {
              Alert.alert("Your Profile Picture is changed","")
              this.setState({ fileData: null });
          })
          .catch(error => {
          console.log("upload error", error);
          Alert.alert("Upload failed!");
          });
    })
  })
};

update  = async () => {
  if(this.state.fileData != null){
  await this.handleUploadPhoto();

  const userID = this.props.navigation.state.params.user_id;
  await fetch(`${BASE_URL}/api/v1/users/update`,{
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name:this.state.first_name,
      last_name:this.state.last_name,
      id:userID,
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
        if(res.success){
         Alert.alert("Details Updated")
         this.props.navigation.push("Detail",{userDetails:res.user})
        }else{
          alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        }
    }).catch((err) => console.log(err))
  }else{
    const userID = this.props.navigation.state.params.user_id;
    await fetch(`${BASE_URL}/api/v1/users/update`,{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name:this.state.first_name,
        last_name:this.state.last_name,
        id:userID,
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
          if(res.success){
            
           Alert.alert("Details Updated")
           this.props.navigation.push("Detail",{userDetails:res.user})
          }else{
            alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
          }
      }).catch((err) => console.log(err))
  }
    
}

  render() {
    return  (
      <View  style={styles.BG_STYLE}>
        <Background/>
        <Header title="Settings" backIcon={true} onbackIconPress={() => this.props.navigation.goBack()} />
        <KeyboardAvoidingView style={{flex:1}}  behavior="height">
        <ScrollView >
      <View  style={{padding:5}}>  
      <View style={{height:120,width:WIDTH,justifyContent:'center',alignItems:'center'}}>
          <Image style={{width:100,height:100,borderRadius:50,backgroundColor:'white',borderWidth:4,borderColor:LIGHT_GREY}} source={{uri:this.state.fileData != null ?  'data:image/jpeg;base64,' + this.state.fileData  : `${BASE_URL}${this.state.profile}`  }} />
        <TouchableOpacity onPress={this.chooseImage} style={{width:40,height:40,borderRadius:20,justifyContent:'center',alignItems:'center',position:'absolute',bottom:10,right:130,backgroundColor:GREY}} >
          <Ionicons name="ios-add" size={20} color="white" />
        </TouchableOpacity>
      </View>
      {/* {this.state.fileData != null  ? <TouchableOpacity onPress={this.handleUploadPhoto}><Text style={{padding:10,color:'grey',fontSize:18,fontWeight:"bold"}}>Upload</Text></TouchableOpacity> :null} */}

    <TouchableOpacity  style={{marginBottom:10, width: WIDTH, padding: 10,flexDirection:'row', borderBottomColor: GREY, borderBottomWidth: .5, }} >
      <TextInput
        style={{width:WIDTH/2,backgroundColor:BG_COLOR,color:'grey',}}
        value={this.state.first_name}
        placeholder={"First Name"}
        onChangeText={(first_name) => this.setState({first_name})}
      />
      <AntDesign style={{textAlign:'right',width:(WIDTH/2)-40}} color={"white"} size={18} name={"edit"} />
    </TouchableOpacity>
   
    <TouchableOpacity  style={{marginBottom:10, width: WIDTH, padding: 10,flexDirection:'row', borderBottomColor: GREY, borderBottomWidth: .5, }} >
      <TextInput
        style={{width:WIDTH/2,backgroundColor:BG_COLOR,color:'grey',}}
        placeholder={"Last Name"}
        value={this.state.last_name}
        onChangeText={(last_name) => this.setState({last_name})}
      />
      <AntDesign style={{textAlign:'right',width:(WIDTH/2)-40}} color={"white"} size={18} name={"edit"} />
  </TouchableOpacity>


    <TouchableOpacity  style={{marginBottom:10, width: WIDTH, padding: 10,flexDirection:'row', borderBottomColor: GREY, borderBottomWidth: .5, }} >
      <TextInput
        style={{width:WIDTH/2,backgroundColor:BG_COLOR,color:'grey',}}
        placeholder={"DOB"}
        value={this.state.dob}
        onChangeText={(dob) => this.setState({dob})}
      />
      <AntDesign style={{textAlign:'right',width:(WIDTH/2)-40}} color={"white"} size={18} name={"edit"} />
    </TouchableOpacity>
    
    <TouchableOpacity  style={{marginBottom:10, width: WIDTH, padding: 10,flexDirection:'row', borderBottomColor: GREY, borderBottomWidth: .5, }} >
      <TextInput
        style={{width:WIDTH/2,backgroundColor:BG_COLOR,color:'grey',}}
        placeholder={"Year"}
        value={this.state.year}
        onChangeText={(year) => this.setState({year})}
      />
      <AntDesign style={{textAlign:'right',width:(WIDTH/2)-40}} color={"white"} size={18} name={"edit"} />
    </TouchableOpacity>


    <TouchableOpacity  style={{marginBottom:10, width: WIDTH, padding: 10,flexDirection:'row', borderBottomColor: GREY, borderBottomWidth: .5, }} >
      <TextInput
        style={{width:WIDTH/2,backgroundColor:BG_COLOR,color:'grey',}}
        placeholder={"Address"}
        value={this.state.address}
        onChangeText={(address) => this.setState({address})}
      />
      <AntDesign style={{textAlign:'right',width:(WIDTH/2)-40}} color={"white"} size={18} name={"edit"} />
    </TouchableOpacity>

    <TouchableOpacity  style={{marginBottom:10, width: WIDTH, padding: 10,flexDirection:'row', borderBottomColor: GREY, borderBottomWidth: .5, }} >
      <TextInput
        style={{width:WIDTH/2,backgroundColor:BG_COLOR,color:'grey',}}
        placeholder={"City"}
        value={this.state.city}
        onChangeText={(city) => this.setState({city})}
      />
      <AntDesign style={{textAlign:'right',width:(WIDTH/2)-40}} color={"white"} size={18} name={"edit"} />
    </TouchableOpacity>

    <TouchableOpacity  style={{marginBottom:10, width: WIDTH, padding: 10,flexDirection:'row', borderBottomColor: GREY, borderBottomWidth: .5, }} >
      <TextInput
        style={{width:WIDTH/2,backgroundColor:BG_COLOR,color:'grey',}}
        placeholder={"State"}
        value={this.state.state}
        onChangeText={(state) => this.setState({state})}
      />
      <AntDesign style={{textAlign:'right',width:(WIDTH/2)-40}} color={"white"} size={18} name={"edit"} />
    </TouchableOpacity>

    <TouchableOpacity  style={{marginBottom:10, width: WIDTH, padding: 10,flexDirection:'row', borderBottomColor: GREY, borderBottomWidth: .5, }} >
      <TextInput
        style={{width:WIDTH/2,backgroundColor:BG_COLOR,color:'grey',}}
        placeholder={"Institute name"}
        value={this.state.institute_name}
        onChangeText={(institute_name) => this.setState({institute_name})}
      />
      <AntDesign style={{textAlign:'right',width:(WIDTH/2)-40}} color={"white"} size={18} name={"edit"} />
    </TouchableOpacity>
  
    <TouchableOpacity  onPress={this.update} style={{backgroundColor:GREEN,margin:5,height:60,justifyContent:'center',alignItems:'center',flex:1,borderRadius:10}}>
    <Text style={{color:GREY,fontSize:14,width:WIDTH,textAlign:'center'}}> DONE </Text>
    </TouchableOpacity>


        </View>

        </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }
}
