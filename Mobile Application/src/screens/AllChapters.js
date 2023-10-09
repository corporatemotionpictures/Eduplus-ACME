import React, { Component } from 'react';
import { View, Text, FlatList, ScrollView, AsyncStorage, TouchableOpacity, Image } from 'react-native';
import Thumbnail from '../utils/Thumbnail';
import { Header, styles, HEIGHT, GREEN, LIGHTGREY, WIDTH } from '../utils/utils';
import HeadingText from '../utils/HeadingText';
import { fetchSubject, fetchchapters, fetchChapters, fetchChapterSubjectWise, BASE_URL } from '../utils/configs';
import Loader from '../utils/Loader';
import BlankError from '../utils/BlankError';
import Background from '../utils/Background';
import {LinearGradient} from "expo-linear-gradient"
import {Ionicons} from "@expo/vector-icons"
import {List} from "react-native-paper"
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';

export default class AllChapters extends Component {
  constructor(props) {
    super(props);
    this.state = {
        chapters:[],
        subejctID:this.props.navigation.state.params.item.id,
        subject:this.props.navigation.state.params.item,
        title:this.props.navigation.state.params.item.name,
        loading:true,
        loadingMore:false,
        offset:0,
        token:''
    };
  }


   componentWillMount(){
    AsyncStorage.getItem('course_name').then((coursename) => this.setState({coursename: coursename}))
     AsyncStorage.getItem("user_token").then(token =>{ 
     console.log(this.state.title)
     if(this.state.subejctID !== null){
       const offset = this.state.offset
      fetchChapterSubjectWise(token,offset,this.state.subejctID).then(data =>{
        if(data.success){
          this.setState({
            chapters:data.chapters,
            loading:false,
            token:token
          })
          console.log("CHAPTERS "+ this.state.chapters)
        }else{
          this.setState({
            chapters:data.chapters,
            loading:false,
            token:token
          })
        }
        }) 
      }
  })
     
  }

renderOneLiner = ({item,index}) => {
  console.log("ONELINER" +item)
        return (
          <TouchableOpacity onPress={() => this.props.navigation.navigate("OneLinear",{item:item})} style={{marginHorizontal:10,borderBottomColor:"#ececec",borderBottomWidth:.5,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:heightPercentageToDP(2)}} >
          {/* <Ionicons name="md-play-circle" size={heightPercentageToDP(4)} color={LIGHTGREY} /> */}
            <Image source={require("../../assets/online-class.png")} style={{height:heightPercentageToDP(3.8),width:heightPercentageToDP(3.8)}} />
            <View>
                <Text numberOfLines={2} style={{color:'black',fontSize:15,width: widthPercentageToDP(75),fontFamily:'Roboto-Regular'}}>{item.name}</Text>
                <View style={{flexDirection:'row',}}>
                  <Text numberOfLines={1} style={{backgroundColor:"#dbefff",padding:5,color:GREEN,borderRadius:4,textAlign:'center',marginTop:5,fontSize:10,}}>{this.state.coursename}</Text>
                </View>
            </View>
            <View style={{margin:10,alignItems:'center',justifyContent:'center',}}>
                <Ionicons name="ios-arrow-forward" size={20} color="grey" />   
          </View>
</TouchableOpacity>

      )
}


renderPreviousPaper = ({item,index}) => {
  return(
    <TouchableOpacity onPress={() => this.props.navigation.navigate("PreviousYear",{item:item})} style={{marginHorizontal:10,borderBottomColor:"#ececec",borderBottomWidth:.5,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:heightPercentageToDP(2)}} >
    {/* <Ionicons name="md-play-circle" size={heightPercentageToDP(4)} colousr={LIGHTGREY} /> */}
      <Image source={require("../../assets/online-class.png")} style={{height:heightPercentageToDP(3.8),width:heightPercentageToDP(3.8)}} />
      <View>
          <Text numberOfLines={2} style={{color:'black',fontSize:15,width: widthPercentageToDP(75),fontFamily:'Roboto-Regular'}}>{item.name}</Text>
          <View style={{flexDirection:'row',}}>
            <Text numberOfLines={1} style={{backgroundColor:"#dbefff",padding:5,color:GREEN,borderRadius:4,textAlign:'center',marginTop:5,fontSize:10,}}>{this.state.coursename}</Text>
          </View>
      </View>
      <View style={{margin:10,alignItems:'center',justifyContent:'center',}}>
          <Ionicons name="ios-arrow-forward" size={20} color="grey" />   
    </View>
</TouchableOpacity>
  )  
}

renderVideosChapter = ({item,index}) => {
  return(
    <TouchableOpacity onPress={() => this.props.navigation.navigate("VideoList",{item:item})} style={{marginHorizontal:10,borderBottomColor:"#ececec",borderBottomWidth:.5,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:heightPercentageToDP(2)}} >
    {/* <Ionicons name="md-play-circle" size={heightPercentageToDP(4)} color={LIGHTGREY} /> */}
      <Image source={require("../../assets/online-class.png")} style={{height:heightPercentageToDP(3.8),width:heightPercentageToDP(3.8)}} />
      <View>
          <Text numberOfLines={2} style={{color:'black',fontSize:15,width: widthPercentageToDP(75),fontFamily:'Roboto-Bold'}}>{item.name}</Text>
          <View style={{flexDirection:'row',}}>
            <Text numberOfLines={1} style={{backgroundColor:"#dbefff",padding:5,color:GREEN,borderRadius:4,textAlign:'center',marginTop:5,fontSize:10,}}>{this.state.coursename}</Text>
          </View>
      </View>
      <View style={{margin:10,alignItems:'center',justifyContent:'center',}}>
          <Ionicons name="ios-arrow-forward" size={20} color="grey" />   
    </View>
</TouchableOpacity>
  )  
}


  fetchMore(){ 
    if(this.state.subejctID !== null){
      const offset = this.state.offset
      console.log(offset)
     fetchSubject(this.state.subejctID,this.state.token,offset).then(data => {
    if(data.chapters.length != 0 ){
      this.setState({
        chapters:[...this.state.chapters,...data.chapters],
        loadingMore:false
      });
    }else{
      this.setState({
        loadingMore:false
      })
    }
    }); 
    }else{
     fetchchapters(token).then(data => this.setState({
       chapters:data.chapters,
       loadingMore:false
     }));
    }
}

loadMore = () => {
  this.setState({
        offset: this.state.offset + 10,
        loadingMore: true
      },() => {
        this.fetchMore()
      })
 }   


 _renderFooter = () => {
  if (!this.state.loadingMore) return null;
  return (
    <View
      style={{
        position: "relative",
        width: "100%",
        height: 200,
        paddingVertical: 20,
        marginTop: 10,
        marginBottom: 10
      }}
    >
    </View>
  );
};    

  render() {
    return (this.state.loading ? <Loader /> :
       <View style={[styles.BG_STYLE,{backgroundColor:'white',flex:1,padding:0}]}>
         {/* <Background/> */}
          <Header backIcon={true} onbackIconPress={() => this.props.navigation.goBack()} title={this.state.title} />
          {this.state.chapters.length == 0 ?  
           <View style={{flex:1,justifyContent:'center',alignItems:"center"}}>
            <BlankError text={`Chapters not available`} />
           </View>
           : <ScrollView style={{flex:1}}>
            <View>

            <List.Accordion style={{backgroundColor:"white",borderRadius:8,borderBottomWidth:.5,borderBottomColor:'#ececec'}} titleStyle={{color:"black",fontFamily:'Roboto-Bold'}}   title={"Important Questions"}>
                                {
                    this.state.chapters.length 
                      !==0 ?   
                    <FlatList
                        onEndReachedThreshold={.5}
                        onEndReached={this.loadMore}
                        data={this.state.chapters}
                        renderItem={this.renderOneLiner}
                     /> 
                    : 
                    <BlankError text="Chapters not available"/>
                }
            </List.Accordion>
                <List.Accordion style={{backgroundColor:"white",borderRadius:8,borderBottomWidth:.5,borderBottomColor:'#ececec'}} titleStyle={{color:"black",fontFamily:'Roboto-Bold'}}   title="Notes and Assignment" expanded={true}>
                {this.state.chapters.length !==0 ?   
                <FlatList
                    // ListFooterComponent={this._renderFooter}   
                    onEndReachedThreshold={.5}
                    onEndReached={this.loadMore}
                    data={this.state.chapters}
                    renderItem={this.renderPreviousPaper}
            /> : <BlankError text="Chapters not available"/>}
                </List.Accordion>

                    {/* <List.Accordion style={{backgroundColor:"white",borderRadius:8,borderBottomWidth:.5,borderBottomColor:'#ececec'}} titleStyle={{color:"black",fontFamily:'Roboto-Bold'}}   title="Video Lectures">
                {this.state.chapters.length !==0 ?   
                <FlatList
                    // ListFooterComponent={this._renderFooter}   
                    onEndReachedThreshold={.5}
                    onEndReached={this.loadMore}
                    data={this.state.chapters}
                    renderItem={this.renderVideosChapter}
            /> : <BlankError text="Chapters not available"/>}
                </List.Accordion> */}
                </View>
                </ScrollView>}
      </View>
    );
  }
}
