import React, { Component } from 'react';
import { View, Text, AsyncStorage, FlatList, TouchableOpacity, Image } from 'react-native';
import Loader from '../utils/Loader';
import { Header, WIDTH, LIGHTGREY } from '../utils/utils';
import LinearGradient from 'react-native-linear-gradient';
import { BASE_URL, fetchLiveEvents } from '../utils/configs';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import {AntDesign} from "@expo/vector-icons"
export default class Live extends Component {
  constructor(props) {
    super(props);
    this.state = {
        liveEvents:[],
        loading:true
    };
  }

  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => { 
        console.log("LIVE CALLED")
        this.fetchliveEvent();
      },
    );
  }

  componentWillUnmount() {
    this.didFocusListener.remove();
  }

  fetchliveEvent() {
    AsyncStorage.getItem("user_token").then(token =>{
      fetchLiveEvents(null, token).then(res => {
          console.log(res)
          this.setState({
            liveEvents: res.events,
            loading:false
          })
          console.log("LIVEEVENTS" + this.state.liveEvents)
        })
  
    })
  }

  renderItem =({item,index}) =>{
      return (
        <TouchableOpacity onPress={()=> this.props.navigation.navigate("LivePlayer",{item:item})} style={{flexDirection:'row',justifyContent:'space-between',width:WIDTH-20,borderBottomColor:LIGHTGREY,borderBottomWidth:.5}}>
        <View style={{height: heightPercentageToDP("12%"),width: heightPercentageToDP("14%") ,borderRadius:10,margin:0,overflow:'hidden',paddingTop:0,margin:5,}}>
          <View   style={{flex:1,height: heightPercentageToDP("12%"),width: heightPercentageToDP("16%"), borderRadius:10,}}>
            <Image source={{uri:`${BASE_URL}${item.thumbnail}`}} style={{height: heightPercentageToDP("14%"),width: heightPercentageToDP("18%") }} />
        <LinearGradient colors={[ 'transparent','rgba(0,0,0,0.8)',]} style={{flex:1,position:'absolute',top:0,bottom:0,left:0,right:0,justifyContent:'flex-end',alignItems:'flex-start',height: heightPercentageToDP("14%"),width: heightPercentageToDP("18%") }} >
        <Text numberOfLines={2}  style={{color:'white',fontSize:heightPercentageToDP("1"),margin:heightPercentageToDP("1.2"),width:heightPercentageToDP("12%"),position:'absolute',bottom:heightPercentageToDP(2)}}>
            {item.title}
          </Text>
      </LinearGradient>
    </View>
    <View style={{position:'absolute',top:0,left:0,bottom:0,right:0,justifyContent:'center',alignItems:'center'}}>
          {/* <Ionicons name="md-lock" size={40} color="white" /> */}
          <Image source={require("../../assets/play-button-min.png")} style={{width:40,height:40,resizeMode:'contain'}} />
    </View>
    </View>
    <View style={{margin:5,padding:10,width:widthPercentageToDP("60%"),}}>
          <Text style={{color:"grey",fontSize:heightPercentageToDP("2"),width:WIDTH/2}} numberOfLines={2}>{item.title}</Text>
          <Text style={{color:"grey",fontSize:heightPercentageToDP("1.7"),width:WIDTH/2,fontWeight:'bold'}} numberOfLines={2}>{item.description}</Text>
          {/* <Text style={{color:"grey",width:WIDTH/2,fontSize:heightPercentageToDP("1.5%")}} numberOfLines={1}><AntDesign name="clockcircleo" size={heightPercentageToDP("1.5%")} color={"white"} />  {getMinutesFromSeconds(item.duration)}</Text> */}
    </View>
    <Text style={{color:'white',position:'absolute',top:10,right:10,backgroundColor:'red',padding:5,fontSize:heightPercentageToDP(1.4)}} >Live</Text>
    </TouchableOpacity>
      )
  }

  render() {
    return this.state.loading ? <Loader /> : (
      <View style={{flex:1}}>
            <Header backIcon title="Live Events" onbackIconPress={() => this.props.navigation.goBack()} />
            <View style={{flex:1,}}>
                    <FlatList 
                        renderItem={this.renderItem}
                        data={this.state.liveEvents}
                    />
            </View>
      </View>
    );
  }
}
