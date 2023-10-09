import React, { Component } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, Modal, AsyncStorage, Image } from 'react-native';
import { styles, Header, GREY, WIDTH, LIGHTGREY } from '../../utils/utils';
import Thumbnail from '../../utils/Thumbnail';
import HeadingText from '../../utils/HeadingText';
import List from '../../utils/List';
import { fetchPreviousPapers, BASE_URL } from '../../utils/configs';
import {FontAwesome} from "@expo/vector-icons"
import PDFReader from 'rn-pdf-reader-js'
import Loader from '../../utils/Loader';
import BlankError from '../../utils/BlankError';
import Background from '../../utils/Background';
import { Ionicons, MaterialIcons, AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import { heightPercentageToDP as hp, widthPercentageToDP as wp, removeOrientationListener, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';

export default class PreviousYear extends Component {
  constructor(props) {
    super(props);
    this.state = {
        chapterID:this.props.navigation.state.params.item.id,
        title:this.props.navigation.state.params.item.name,
        papers:[],
        showPDF:false,
        url:'',
        loading:true,
        loadingMore:false,
        offset:0,
        token:''
    };
  }


  componentDidMount(){
   AsyncStorage.getItem("user_token").then(token =>{
    fetchPreviousPapers(this.state.chapterID,token,this.state.offset).then((data) =>{
      this.setState({
        papers:data.previousYearQuestions,
        loading:false,
        token:token
      })
   })
   })
}


renderList = ({item,index}) =>{
        return(
        //   <TouchableOpacity onPress={() => this.props.navigation.navigate("PdfViewer",{item})} style={{ justifyContent: 'space-between', alignItems: 'center', width: WIDTH-20, padding: 10, flexDirection: 'row', borderBottomColor: LIGHTGREY, borderBottomWidth: .5 }} >
        //   <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
        //   <FontAwesome size={20} color="grey" name="file-pdf-o"/>
        //     <Text style={{ color: 'grey', fontSize: 14, paddingLeft: 15, padding: 10, textAlign: 'left' }}>{item.title}</Text>
        //   </View>
        //   <FontAwesome size={20} color="white" name="eye"/>
        // </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.navigation.navigate("PdfViewer",{item})} style={{ marginHorizontal: 10, borderBottomColor: "#ececec", borderBottomWidth: .5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: heightPercentageToDP(2), }} >
          {/* <Ionicons name="md-play-circle" size={heightPercentageToDP(4)} color={LIGHTGREY} /> */}
          <Image source={require("../../../assets/online-class.png")} style={{ height: heightPercentageToDP(3), width: heightPercentageToDP(3) }} />
          <View>
            <Text numberOfLines={2} style={{ color: 'black', fontSize: 15, width: widthPercentageToDP(75), fontFamily: 'Lato' }}>{item.title}</Text>
            <View style={{ flexDirection: 'row', }}>
              {/* <Text numberOfLines={1} style={{backgroundColor:"#dbefff",padding:5,color:NEWBLUE,borderRadius:4,textAlign:'center',marginTop:5,fontSize:10,}}>Petrolium Engineering</Text> */}
            </View>
          </View>
          <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', }}>
            <Ionicons name="ios-arrow-forward" size={16} color="grey" />
          </View>
        </TouchableOpacity>
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
     fetchPreviousPapers(this.state.chapterID,this.state.token,offset).then(data => {
    if(data.previousYearQuestions.length !=0){
      this.setState({
        papers:[...this.state.papers,...data.previousYearQuestions],
        loadingMore:false
      })
    }else{
      this.setState({
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
          height: 50,
          paddingVertical: 20,
          marginTop: 10,
          marginBottom: 10
        }}>
      </View>
    );
  };    

  
  

  render() {
    return (
      <View style={styles.BG_STYLE}>
        <Background/>
          <Header  backIcon={true} onbackIconPress={() => this.props.navigation.goBack()}  title={this.state.title} rightIcon="" />
            {/* <HeadingText text="PDF Files" /> */}
            {  this.state.loading ? <Loader /> :(this.state.papers.length != 0 ? 
            <FlatList
                  ListFooterComponent={this._renderFooter}   
                  onEndReachedThreshold={.5}
                  onEndReached={this.loadMore}
                  style={{flex:1}}
                  data={this.state.papers}
                  renderItem={this.renderList}/> 
                  :
                  <BlankError text="Document not available" />)}
      </View>
    );
  }
}
