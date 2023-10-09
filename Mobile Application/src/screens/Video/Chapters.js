import React, { Component } from 'react';
import { View, Text, FlatList,Image,ScrollView, AsyncStorage, TouchableOpacity } from 'react-native';
import { styles, Header, LIGHTGREY, GREEN, WIDTH, BLUE, SECONDARY_COLOR } from '../../utils/utils';
import Thumbnail from '../../utils/Thumbnail';
import HeadingText from '../../utils/HeadingText';
import { fetchchapters, BASE_URL, fetchChapters, fetchChapterSubjectWise } from '../../utils/configs';
import Loader from '../../utils/Loader';
import BlankError from '../../utils/BlankError';
import Background from '../../utils/Background';
import {Ionicons} from "@expo/vector-icons"
import {LinearGradient} from "expo-linear-gradient"
import { ActivityIndicator } from 'react-native-paper';

export default class Chapters extends Component {

  constructor(props) {
    super(props);
    this.state = {
        chapters:[],
        loading:true,
        loadingMore:false,
        offset:0,
        chapters:[],
        questions:[],
        subject:this.props.navigation.state.params.item
    };
  }

   componentDidMount(){
    AsyncStorage.getItem("user_token")
      .then(token =>{
        fetchChapterSubjectWise(token,this.state.offset,this.state.subject.id).then(data => {
          this.setState({
          chapters:data.chapters,
          loading:false
        });
        console.log(data)
      })
    })
  }


loadMore = () => {
  this.setState({
        offset: this.state.offset + 10,
        loadingMore: true
      },() => {
        this.fetchMore()
      })
 }   

   fetchMore = () => { 
      const offset = this.state.offset
      console.log(offset)
     fetchChapters(this.state.coursesID,offset).then(data => {
    if(data.chapters.length !=0){
      this.setState({
        chapters:[...this.state.chapters,...data.chapters],
        loadingMore:false
      })
    }else{
      this.setState({
        chapters:[...this.state.chapters,data.chapters],
        loadingMore:false
      })
    }
    }); 
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


  renderChapters = ({item,index}) => {
      return item.locked ? null : (
          <TouchableOpacity onPress={() => this.props.navigation.navigate("VideoList",{item:item})} style={{height:70,margin:10,borderBottomColor:LIGHTGREY,borderBottomWidth:.5,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}} >
                    <Ionicons name="md-play" size={20} color={LIGHTGREY} />
                      <View>
                          <Text numberOfLines={2} style={{color:'grey',fontSize:15,width: 280,}}>{item.name}</Text>
                          <Text numberOfLines={1} style={{backgroundColor:GREEN,padding:5,paddingHorizontal:8,color:'white',borderRadius:4,textAlign:'center',width:WIDTH/2,marginTop:5,fontSize:10}}>{item.subject_name}</Text>
                      </View>
                      <View style={{margin:10,alignItems:'center',justifyContent:'center',}}>
                          <Ionicons name="ios-arrow-forward" size={20} color="grey" />   
                    </View>
          </TouchableOpacity>
      )  
  }

  render() {
    
    return (
      <View style={styles.BG_STYLE}>
        <Background/>
          <Header  title={this.state.subject.name} backIcon onbackIconPress={() => this.props.navigation.goBack()} />
          {this.state.loading ? <Loader /> : <ScrollView>
            <HeadingText text="Chapters" />
         {this.state.loading ? <ActivityIndicator size="large" color={BLUE} /> : 
         (this.state.chapters.length !== 0 ?  
             <View style={{flex:1}}>
              <FlatList 
                showsHorizontalScrollIndicator={false}
                ListFooterComponent={this._renderFooter}   
                onEndReachedThreshold={.5}
                onEndReached={this.loadMore}
                style={{flex:1}}
                data={this.state.chapters}
                renderItem={this.renderChapters}
              /> 
              </View>
              : 
              <BlankError text="Chapters not available" />
              )}
                </ScrollView>}   
      </View>
    );
  }
}
