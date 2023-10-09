import React, { Component } from 'react';
import { View, Text, FlatList, ScrollView, AsyncStorage, Image, TouchableOpacity } from 'react-native';
import { styles, Header,GRAD1,GRAD2 ,BLUE, WIDTH} from '../../utils/utils';
import Thumbnail from '../../utils/Thumbnail';
import HeadingText from '../../utils/HeadingText';
import { fetchExams, fetchSubject, BASE_URL } from '../../utils/configs';
import Loader from '../../utils/Loader';
import BlankError from '../../utils/BlankError';
import Background from '../../utils/Background';
import ShimmerLoader from '../../utils/ShimmerLoader';
import SubjetcLoader from '../../utils/SubjectLoader';

import AwesomeAlert from "react-native-awesome-alerts"
import LinearGradient from 'react-native-linear-gradient';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';


export default class ExamLives extends Component {
  constructor(props) {
    super(props)
    this.state = {
        exams:[],
        loading:true,
        loadingMore:false,
        offset:0,
        token:'',
        packageLocked:false
    };
  }

  componentWillMount() {
    this.fetchLiveExams();
  }

  // componentDidMount() {
  //   this.didFocusListener = this.props.navigation.addListener(
  //     'didFocus',
  //     () => { 
  //       //console.log("LIVE CALLED")
  //       this.fetchLiveExams();
  //     },
  //   );
  // }

  // componentWillUnmount() {
  //   this.didFocusListener.remove();
  // }

  fetchLiveExams() {
    AsyncStorage.getItem("user_token")
    .then(token =>{
      fetchExams(token,this.state.offset).then(data => this.setState({
        exams:data.exams,
        loading:false,
        token:token
      })
      );
      console.log("EXAMLIVEDATA " + this.state.exams.length)
    })
  }


renderList = ({item,index}) => {
       return (
        <TouchableOpacity onPress={() => this.props.navigation.navigate("ExamDetails", { item: item })} style={{ height: heightPercentageToDP(18), width: widthPercentageToDP(30), borderRadius: 4, margin: 5, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
        <View style={{ flex: 1, borderRadius: 10, paddingTop: 0, }}>
          <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: widthPercentageToDP(30), height: heightPercentageToDP(18), }} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', width: widthPercentageToDP(30), height: heightPercentageToDP(18), }} >
            <Text style={{ color: 'white', fontSize: heightPercentageToDP(2), margin: 10, width: 80, position: 'absolute', bottom: 4 }} numberOfLines={2} >
              {item.name}
            </Text>
          </LinearGradient>
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
      console.log(offset)
     fetchExams(this.state.token,offset).then(data => {
    if(data.exams.length !=0){
      this.setState({
        exams:[...this.state.exams,...data.exams],
        loadingMore:false
      })
    }else{
      this.setState({
        loadingMore:false
      })
    }
    }); 
  }


  render() {
    return (
      <View style={styles.BG_STYLE}>
        <Background />
          <Header  title="Live Classes" />
            {/* <HeadingText text="Exams" /> */}
            {this.state.loading ? <SubjetcLoader /> : (this.state.exams.length !==1 ? 
            <FlatList
            ListFooterComponent={this._renderFooter}   
            onEndReachedThreshold={.5}
            onEndReached={this.loadMore}
                style={{flex:1,alignSelf:'center'}}
                numColumns={3}
                data={this.state.exams}
                renderItem={this.renderList}
            /> : <BlankError text="Exams not available"/>)}
            
            <AwesomeAlert
          show={this.state.packageLocked}
          showProgress={false}
          title={`Exam Locked!`}
          message={`You have not subscribed to this exam. Please upgrade course plan to activate this exam  `}
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
