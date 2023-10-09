import React, { Component } from 'react';
import { View, Text, FlatList,Image,ScrollView, AsyncStorage, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles, Header, LIGHTGREY, GREEN, WIDTH, BLUE } from '../../utils/utils';
import Thumbnail from '../../utils/Thumbnail';
import HeadingText from '../../utils/HeadingText';
import { fetchSubjects, BASE_URL, fetchChapters } from '../../utils/configs';
import Loader from '../../utils/Loader';
import BlankError from '../../utils/BlankError';
import Background from '../../utils/Background';
import {Ionicons} from "@expo/vector-icons"
import {LinearGradient} from "expo-linear-gradient"
import AwesomeAlert from "react-native-awesome-alerts"
import { widthPercentageToDP } from 'react-native-responsive-screen';

export default class Subject extends Component {
  constructor(props) {
    super(props);
    this.state = {
        subjects:[],
        loading:true,
        loadingMore:false,
        offset:0,
        chapters:[],
        questions:[],
        packageLocked:false
    };
  }


   componentDidMount(){
    AsyncStorage.getItem("user_token")
      .then(token =>{
        fetchSubjects(token,this.state.offset).then(data => {
          this.setState({
          subjects:data.subjects,
          loading:false
        });
        console.log(data)
      })
      fetchChapters(token,this.state.offset).then(data =>{
        this.setState({
          chapters:data.chapters,
          loading:false
        })
      }) 
    })
  }

renderList = ({item,index}) => {


        return item.locked ?  (
          <View style={{ height: 100, width: 100, borderRadius: 10, margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
            <TouchableOpacity onPress={() => {
              this.setState({ searchModal: false ,packageLocked:true})
            }} style={{ flex: 1, height: 80, width: 80, borderRadius: 10, paddingTop: 0, }}>
              <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: 100, height: 100, }} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: 100, width: 120 }} >
                <Text style={{ color: 'white', fontSize: 8, margin: 10, width: 100, position: 'absolute', bottom: 2 }}>
                  {item.name}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                 <Ionicons name="md-lock" size={35} color="white" />
              {/* <Image source={require("../../assets/play-button-min.png")} style={{width:40,height:40,resizeMode:'contain'}} /> */}
            </View>
          </View>
        ) : (
          <View style={{ height: 100, width: 100, borderRadius: 10, margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
            <TouchableOpacity onPress={() => {
              this.setState({ searchModal: false })
              this.props.navigation.navigate("Chapters", { item: item })
            }} style={{ flex: 1, height: 80, width: 80, borderRadius: 10, paddingTop: 0, }}>
              <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: 100, height: 100, }} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: 100, width: 120 }} >
                <Text style={{ color: 'white', fontSize: 10, margin: 10, width: 100, position: 'absolute', bottom: 4 }}>
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
     fetchSubjects(this.state.coursesID,offset).then(data => {
    if(data.subjects.length !=0){
      this.setState({
        subjects:[...this.state.subjects,...data.subjects],
        loadingMore:false
      })
    }else{
      this.setState({
        // subjects:[...this.state.subjects,data.subjects],
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
  console.log("ONELINER")
  console.log(item.courses[0].name)
  return item.locked ? null : (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("OneLinear",{item:item})} style={{margin:10,borderBottomColor:LIGHTGREY,borderBottomWidth:.5,flexDirection:'row',justifyContent:'space-between',padding:5}} >
                <View >
                    <Text numberOfLines={2} style={{color:'grey',fontSize:15,width: 280,}}>{item.name}</Text>
  <Text numberOfLines={1} style={{backgroundColor:GREEN,padding:5,paddingHorizontal:8,color:'white',borderRadius:4,textAlign:'center',width:widthPercentageToDP(30),marginTop:5}}>{item.courses[0].name}</Text>
                </View>
                <View style={{margin:10,alignItems:'center',justifyContent:'center',paddingBottom:15}}>
                    <Ionicons name="ios-arrow-forward" size={20} color="grey" />   
                </View>
      </TouchableOpacity>
  )  
}


renderQuestion = ({item,index}) => {
  return item.locked ? null :  (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("OneLinear",{item:item})} style={{height:60,margin:10,borderBottomColor:LIGHTGREY,borderBottomWidth:.5,flexDirection:'row',justifyContent:'space-between'}} >
                <View>
                    <Text numberOfLines={2} style={{color:'white',fontSize:15,width: 280,}}>{item.name}</Text>
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
              <Header  title="One Liner Questions"  />
              {this.state.loading ? <Loader /> : <ScrollView>
                <HeadingText text="SUBJECTS" />
            {this.state.loading ? <ActivityIndicator size={"large"} color={BLUE} /> : 
            (this.state.subjects.length != 0 ?  
             <View style={{flex:1}}>
              <FlatList 
                horizontal
                showsHorizontalScrollIndicator={false}
                ListFooterComponent={this._renderFooter}   
                onEndReachedThreshold={.5}
                onEndReached={this.loadMore}
                style={{flex:1}}
                data={this.state.subjects}
                renderItem={this.renderList}
              /> 
              </View>
              : 
              null
              )}
                <HeadingText text="Most Viewed Chapters" />
                  <View style={{flex:1}}>
                  <FlatList 
                    data={this.state.chapters}
                    renderItem={this.renderChapters}
                  />
                </View>
                </ScrollView>}   

                <AwesomeAlert
          show={this.state.packageLocked}
          showProgress={false}
          title={`Subject Locked!`}
          message={`You have not subscribed to this subject. Please upgrade course plan to activate this subject  `}
            closeOnTouchOutside={true}
          closeOnHardwareBackPress={true}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="OK"
          confirmButtonColor={BLUE}
          onConfirmPressed={() => {
            this.setState({
              packageLocked: false
            });
          }}
        />
      </View>
    );
  }
}
