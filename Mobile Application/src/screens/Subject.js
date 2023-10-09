import React, { Component } from 'react';
import { View, Text, FlatList, ScrollView, AsyncStorage } from 'react-native';
import Thumbnail from '../utils/Thumbnail';
import { Header, styles, HEIGHT } from '../utils/utils';
import HeadingText from '../utils/HeadingText';
import { fetchSubject, fetchSubjects } from '../utils/configs';
import Loader from '../utils/Loader';
import BlankError from '../utils/BlankError';
import Background from '../utils/Background';


export default class Subject extends Component {
  constructor(props) {
    super(props);
    this.state = {
        subjects:[],
        coursesID:this.props.navigation.state.params.item.id,
        title:this.props.navigation.state.params.item.name,
        loading:true,
        loadingMore:false,
        offset:0,
        token:''
    };
  }

   componentWillMount(){
     AsyncStorage.getItem("user_token").then(token =>{ 
     console.log(this.state.title)
     if(this.state.coursesID !== null){
       const offset = this.state.offset
      fetchSubject(this.state.coursesID,token,offset).then(data => this.setState({
        subjects:data.subjects,
        loading:false,
        token:token
      })); 
     }else{
      fetchSubjects(token).then(data => this.setState({
        subjects:data.subjects,
        loading:false
      }));
     }
     })
  }


  renderList = ({item,index}) => {
          return (
                <Thumbnail small={true} data={item} onPress={() =>this.props.navigation.navigate("VideoList",{item:item})} />
              )
   }

  fetchMore(){ 
    if(this.state.coursesID !== null){
      const offset = this.state.offset
      console.log(offset)
     fetchSubject(this.state.coursesID,this.state.token,offset).then(data => {
      if(data.subjects.length != 0 ){
        this.setState({
          subjects:[...this.state.subjects,...data.subjects],
          loadingMore:false
        });
      }
      else{
        this.setState({
          loadingMore:false
        })
      }
      }); 
    }
    else
      {
        fetchSubjects(token).then(data => this.setState({
            subjects:data.subjects,
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
      }}>
        <Loader />
      </View>
    );
  };    


  render() {
    return (this.state.loading ? <Loader /> :
       <View style={styles.BG_STYLE}>
         <Background/>
          <Header backIcon={true} onbackIconPress={() => this.props.navigation.goBack()} title={this.state.title} />
            <HeadingText text="SUBJECTS" />
                {this.state.subjects.length !==0 ?   
                <FlatList
                    ListFooterComponent={this._renderFooter}   
                    onEndReachedThreshold={.5}
                    // initialNumToRender={}
                    onEndReached={this.loadMore}
                    style={{flex:1,}}
                    numColumns={2}
                    data={this.state.subjects}
                    renderItem={this.renderList}
            /> : <BlankError text="Subjects not available"/>}
      </View>
    );
  }
}
