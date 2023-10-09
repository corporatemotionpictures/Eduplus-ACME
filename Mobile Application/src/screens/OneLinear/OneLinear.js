import React, { Component } from 'react';
import { View, Text, FlatList, ScrollView, AsyncStorage } from 'react-native';
import { styles, Header, BG_COLOR, LIGHTGREY } from '../../utils/utils';
import Thumbnail from '../../utils/Thumbnail';
import List from '../../utils/List';
import HeadingText from '../../utils/HeadingText';
import {Entypo} from "@expo/vector-icons"
import { fetchQuestions } from '../../utils/configs';
import Loader from '../../utils/Loader';
import BlankError from '../../utils/BlankError';
import Background from '../../utils/Background';
export default class OneLinear extends Component {
  constructor(props) {
    super(props);
    this.state = {
        chapterID:this.props.navigation.state.params.item.id,
        title:this.props.navigation.state.params.item.name,
        showAnswers:false,
        readMode:false,
        oneLineQuestions:[],
        loading:true,
        loadingMore:false,
        offset:0,
        token:'',
        oneLineQuestions:[]
    };
  }


   componentDidMount(){
     console.log("Chpter ID ")
     console.log(this.state.chapterID)
     AsyncStorage.getItem("user_token")
     .then(token =>{
        fetchQuestions(this.state.chapterID,token,this.state.offset).then((data) =>{
        console.log(data)
        this.setState({
          oneLineQuestions:data.oneLineQuestions,
          loading:false,
          token:token
        })
    });   
     })
  }

renderList = ({item,index}) =>{
        return(
            <List lightMode={this.state.readMode}  subtitle={this.state.showAnswers}  data={item}  />
        )
}

togggle = () =>{
  this.setState({
    showAnswers:!this.state.showAnswers
  })
}

toggleRead = () => {
  this.setState({
    readMode:!this.state.readMode
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
     fetchQuestions(this.state.chapterID,this.state.token,offset).then(data => {
    if(data.oneLineQuestions.length != 0){
      this.setState({
        oneLineQuestions:[...this.state.oneLineQuestions,...data.oneLineQuestions],
        loadingMore:false
      })
    }else{
      this.setState({
        loadingMore:false,

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
        <Loader />
      </View>
    );
  };    
  
  



  render() {
    return (
      <View style={[styles.BG_STYLE,{backgroundColor:BG_COLOR}]}>
        <Background />
          <Header backIcon={true} title={this.state.title}  onbackIconPress={() =>this.props.navigation.goBack()}  onPress={this.togggle}  rightIcon={this.state.showAnswers ? "md-eye-off" : "md-eye"} />
             {this.state.loading ?<Loader /> :  (this.state.oneLineQuestions.length != 0 ? 
             <FlatList
                  // ListFooterComponent={this._renderFooter}   
                  onEndReachedThreshold={.5}
                  onEndReached={this.loadMore}
                  style={{flex:1,backgroundColor:this.state.readMode ? "white" : "white"}}
                  data={this.state.oneLineQuestions}
                  renderItem={this.renderList}
              /> : 
              <BlankError text="Questions not available"/>
              )}
                 
            {/* <View style={{backgroundColor:!this.state.readMode ? "white" : BG_COLOR,height:50,width:50,alignItems:'center',justifyContent:'center',position:'absolute',borderRadius:50,bottom:20,right:20}}>
            <Entypo onPress={this.toggleRead} name={!this.state.readMode ? "light-up" :"light-down"} size={22} color={this.state.readMode ? "white" :"white" } />
           </View> */}
      </View>
    );
  }
}
