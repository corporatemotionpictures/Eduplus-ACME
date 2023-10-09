import React, { Component } from 'react';
import { View, Text, FlatList,Image,ScrollView, AsyncStorage, TouchableOpacity } from 'react-native';
import { styles, Header, LIGHTGREY, GREEN } from '../../utils/utils';
import Thumbnail from '../../utils/Thumbnail';
import HeadingText from '../../utils/HeadingText';
import { fetchchapters, BASE_URL, fetchChapters, fetchChapterSubjectWise } from '../../utils/configs';
import Loader from '../../utils/Loader';
import BlankError from '../../utils/BlankError';
import Background from '../../utils/Background';
import {Ionicons} from "@expo/vector-icons"
import {LinearGradient} from "expo-linear-gradient"

export default class LiveChapter extends Component {

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

renderList = ({item,index}) => {
        return(
            <View style={{height: 100,width: 100 ,borderRadius:10,margin:0,overflow:'hidden',paddingTop:0,margin:5,}}>
              <TouchableOpacity  onPress={()=> this.props.navigation.navigate("OneLinear",{item:item})} style={{flex:1,height:80,width:80,borderRadius:10,paddingTop:0,}}>
                  <Image source={{uri:`${BASE_URL}${item.thumbnail}`}} style={{width:100  ,height:100,}} />
              <LinearGradient colors={[ 'transparent','rgba(0,0,0,0.8)',]} style={{flex:1,position:'absolute',top:0,bottom:0,left:0,right:0,justifyContent:'flex-end',alignItems:'flex-start',height:100,width:120}} >
                <Text   style={{color:'white',fontSize:10,margin:10,width:100,position:'absolute',bottom:4}}>
                  {item.name}
                  </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )
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
        // chapters:[...this.state.chapters,data.chapters],
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
      <TouchableOpacity onPress={() => this.props.navigation.navigate("EventList",{item:item})} style={{height:80,margin:10,borderBottomColor:LIGHTGREY,borderBottomWidth:.5,flexDirection:'row',justifyContent:'space-between',}} >
                <View >
                    <Text numberOfLines={2} style={{color:'white',fontSize:15,width: 280,}}>{item.name}</Text>
  <Text style={{backgroundColor:GREEN,padding:5,paddingHorizontal:8,color:'white',borderRadius:4,textAlign:'center',width:120,marginTop:5,fontSize:10}}>{item.subject_name}</Text>
                </View>
                <View style={{margin:10,alignItems:'center',justifyContent:'center',paddingBottom:15}}>
                    <Ionicons name="ios-arrow-forward" size={20} color="white" />   
                </View>
      </TouchableOpacity>
  )  
}



  render() {
    

    return (
      <View style={styles.BG_STYLE}>
        <Background/>
          <Header  title={this.state.subject.name} backIcon onbackIconPress={() => this.props.navigation.goBack()} />
          <ScrollView>
            <HeadingText text="Chapters" />
         {this.state.loading ? <Loader /> : 
         (this.state.chapters.length !== 0 ?  
             <View style={{}}>
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
                </ScrollView>   
      </View>
    );
  }
}

// import React, { Component } from 'react';
// import { View, Text } from 'react-native';

// export default class LiveChapter extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//     };
//   }

//   render() {
//     return (
//       <View>
//         <Text> LiveChapter </Text>
//       </View>
//     );
//   }
// }
