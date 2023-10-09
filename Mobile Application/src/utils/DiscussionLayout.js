import React, { Component } from 'react';
import { View, Text ,TouchableOpacity,Image} from 'react-native';
import { LIGHTGREY, LIGHT_GREY, WIDTH, GREY, GRAD1, GREEN, HEIGHT } from './utils';
import {Ionicons,MaterialCommunityIcons,AntDesign} from "@expo/vector-icons"
import { BASE_URL } from './configs';
import moment from "moment"
import Lightbox from "react-native-lightbox";
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';


export default class DiscussionLayout extends Component {
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
        <View style={{flexDirection:'row',padding:8,marginBottom:0,backgroundColor:"",alignItems:"center",justifyContent:'space-between',borderBottomColor:"#DCDCDC",borderBottomWidth:.2}}>
            <View style={{flexDirection:'row',alignItems:'center',}}>
             {
            user_image != null ?
            <Image source={{uri:`${BASE_URL}${user_image}`}} style={{width:30,height:30,borderRadius:15}} />
              : 
            <AntDesign  size={20} color={LIGHTGREY} name="user" />
            } 
              <Text style={{color:LIGHTGREY,padding:5,textAlign:'left',fontSize:16,marginLeft:10,width:150}} numberOfLines={2}>{user_first_name} {user_last_name} </Text>    
              
              </View>
              {
            subject_name !=null ?
            <Text style={{color:'white',fontSize:12,textAlign:'right',backgroundColor:GREEN,borderRadius:3,padding:5,alignItems:'center', width:widthPercentageToDP(40)}} numberOfLines={1}> {subject_name} </Text>
              :null
            }
        </View>
        {image !=null ? 
         <Lightbox  onOpen={()=> this.setState({lightBox:true})} onClose={() => this.setState({lightBox:false})}    >
           <View>
           <Image source={{uri:`${BASE_URL}${image}`}}  style={{height:this.state.lightBox ? HEIGHT : this.state.imageHeight,width: this.state.imageWidth,resizeMode:this.state.lightBox ? "contain":"cover" }}/>
           {this.state.lightBox ?
           <View style={{position:'absolute',bottom:heightPercentageToDP(10)}}>
                <Text style={{color:'white',marginRight:20,padding:5,textAlign:'left',margin:10,}} >{body}</Text>    
             </View>
            : null
           }
        </View>
        </Lightbox> :null }
        <View   style={{marginBottom:2}}>
             <Text style={{color:LIGHTGREY,marginRight:20,padding:5,textAlign:'left',margin:10,}} >{body}</Text>    
      </View>
             <View style={{flexDirection:'row',marginTop:1,height:50,justifyContent:'space-between',backgroundColor:"#ececec",alignItems:'center',padding:10,}}>
                  <View style={{flexDirection:'row'}}>
                   <Text style={{color:LIGHTGREY,padding:5,textAlign:'right',fontSize:10,borderRadius:8,padding:5,alignItems:'center',}}> {moment(created_at).fromNow()} </Text>
            </View>
            <View  style={{flexDirection:'row',justifyContent:'space-between',}}>
                <View style={{flexDirection:'row'}}>
                <MaterialCommunityIcons name="comment-text-outline" size={17} color={LIGHTGREY} />

                   <Text style={{color:LIGHTGREY,marginLeft:5,fontSize:12}}> {comments} Comments </Text>
                 </View>
                 <TouchableOpacity onPress={this.props.onPress} style={{flexDirection:'row',marginLeft:5}}>
                 <MaterialCommunityIcons name="undo-variant" size={17} color={LIGHTGREY} />
                   <Text style={{color:LIGHTGREY,marginLeft:5,fontSize:12}}> Reply Post </Text>
                   </TouchableOpacity>
            </View>
             </View>
      </View>
      </View>
    );
  }
}
