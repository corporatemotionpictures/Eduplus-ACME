import React, { Component } from 'react';
import { View, Text ,TouchableOpacity,Image} from 'react-native';
import { LIGHTGREY, LIGHT_GREY, WIDTH, GREY, GRAD1, GREEN, HEIGHT } from './utils';
import {Ionicons,MaterialCommunityIcons,AntDesign} from "@expo/vector-icons"
import { BASE_URL } from './configs';
import moment from "moment"
import Lightbox from "react-native-lightbox";
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';

export default class PostThumbnail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageWidth:'100%',
      imageHeight:200,
      lightBox:false
    };
  }

  render() {
      const { user_first_name ,user_last_name ,comments,body,image,user_image,subject_name,created_at } = this.props.data
    return (
      <View onPress={this.props.onOpenPost} style={{backgroundColor:"white",}} >
      <View onPress={this.props.onPress} style={{overflow:'hidden',paddingBottom:0,}}>
        {/* <View style={{flexDirection:'row',padding:8,marginBottom:0,backgroundColor:"",alignItems:"center",justifyContent:'space-between',borderBottomColor:"#DCDCDC",borderBottomWidth:.2}}>
            <View style={{flexDirection:'row',alignItems:'center',}}>
             {
            user_image != null ?
            <Image source={{uri:`${BASE_URL}${user_image}`}} style={{width:30,height:30,borderRadius:15}} />
              : 
            <AntDesign  size={20} color={LIGHTGREY} name="user" />

            } 
              <Text style={{color:LIGHTGREY,padding:5,textAlign:'left',fontSize:16,marginLeft:10,width:150, fontFamily:'Roboto-Regular'}} numberOfLines={2}>{user_first_name} {user_last_name} </Text>    
              
              </View>
              {
            subject_name !=null ?
            <Text style={{color:'white',fontSize:12,textAlign:'right',backgroundColor:GREEN,borderRadius:3,padding:5,alignItems:'center', fontFamily:'Roboto-Regular', right:15}} numberOfLines={1}> {subject_name} </Text>
              :null
            }
        </View> */}
        {image !=null ? 
         <Lightbox  onOpen={()=> this.setState({lightBox:true})} onClose={() => this.setState({lightBox:false})}    >
           <View>
           <Image source={{uri:`${BASE_URL}${image}`}}  style={{height:this.state.lightBox ? HEIGHT : this.state.imageHeight,width: this.state.imageWidth,resizeMode:this.state.lightBox ? "contain":"cover" }}/>
           {this.state.lightBox ?
           <View style={{position:'absolute',bottom:heightPercentageToDP(10), flexDirection:'row'}}>
                <Text style={{color:'white',marginRight:20,padding:5,textAlign:'left',margin:10, fontFamily:'Roboto-Regular'}} >{body}</Text>    
             </View>
            : null
           }
        </View>
        </Lightbox> :null }
        <View style={{ flexDirection: 'row', padding: heightPercentageToDP(1.6),backgroundColor:'#ffffff' }}>
            <Image source={require("../../assets/comment.png")} style={{ width: widthPercentageToDP(9), height: widthPercentageToDP(9), marginTop: heightPercentageToDP(1) }} />
            <View style={{ marginHorizontal: heightPercentageToDP(1), marginLeft: 10, }} >
              <Text numberOfLines={4} style={{ fontSize: heightPercentageToDP(2), fontFamily: 'Roboto-Bold', width: widthPercentageToDP(85), color: '#393939', textAlign:'justify' }} >{body}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: widthPercentageToDP(90), marginTop: heightPercentageToDP(.5) }} >
                <Text numberOfLines={4} style={{backgroundColor:"#dbefff",padding:5,color:GREEN,borderRadius:4,textAlign:'center', fontSize: heightPercentageToDP(1.5), width: widthPercentageToDP(30), fontFamily: 'Roboto-Bold', }} >Petroleum Exploration</Text>
                <Text numberOfLines={4} style={{backgroundColor:"#dbefff",padding:5,color:GREEN,borderRadius:4,textAlign:'center', fontSize: heightPercentageToDP(1.5), marginRight:60, width: widthPercentageToDP(20), fontFamily: 'Roboto-Bold', }} >GATE</Text>
                <Text style={{ color: 'lightgrey', fontSize: heightPercentageToDP(1.4), marginRight:20 }}>1 day ago</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                  {/* <Status status={notifyData.appointment.status} />*/}
                </View>
              </View>
              {/* <Text style={{ color: 'lightgrey', fontSize: heightPercentageToDP(1.4), margin: 4 }}>1 day ago</Text> */}
            </View>
          </View>
             <View style={{flexDirection:'row',marginTop:1,height:50,justifyContent:'space-between',backgroundColor:"#f1f1f1",alignItems:'center',padding:10,}}>
                  <View style={{flexDirection:'row'}}>
                   <Text style={{color:LIGHTGREY,padding:5,textAlign:'right',fontSize:10,borderRadius:8,padding:5,alignItems:'center',fontFamily:'Roboto-Regular'}}> {moment(created_at).fromNow()} </Text>
            </View>
            <View  style={{flexDirection:'row',justifyContent:'space-between',}}>
                <View style={{flexDirection:'row'}}>
                <MaterialCommunityIcons name="comment-text-outline" size={17} color={LIGHTGREY} />

                   <Text style={{color:LIGHTGREY,marginLeft:5,fontSize:12,fontFamily:'Roboto-Regular'}}> {comments} Comments </Text>
                 </View>
                 <TouchableOpacity onPress={this.props.onPress} style={{flexDirection:'row',marginLeft:5}}>
                 <MaterialCommunityIcons name="undo-variant" size={17} color={LIGHTGREY} />
                   <Text style={{color:LIGHTGREY,marginLeft:5,fontSize:12, fontFamily:'Roboto-Regular'}}> Reply Post </Text>
                   </TouchableOpacity>
            </View>
             </View>
      </View>
      </View>
    );
  }
}
