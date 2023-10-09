import React, { Component } from 'react';
import { View, Text, FlatList, ScrollView, AsyncStorage, Image, TouchableOpacity } from 'react-native';
import { styles, Header,GRAD1,GRAD2 ,BLUE, WIDTH} from '../../utils/utils';
import Thumbnail from '../../utils/Thumbnail';
import HeadingText from '../../utils/HeadingText';
import { fetchExams, fetchSubject, BASE_URL, fetchMyCourses, fetchMyCourseDetails } from '../../utils/configs';
import Loader from '../../utils/Loader';
import BlankError from '../../utils/BlankError';
import Background from '../../utils/Background';
import ShimmerLoader from '../../utils/ShimmerLoader';
import SubjetcLoader from '../../utils/SubjectLoader';

import AwesomeAlert from "react-native-awesome-alerts"
import LinearGradient from 'react-native-linear-gradient';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';


export default class Subject extends Component {
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
  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => { 
        this.fetchCourse();
      },
    );
  }

  componentWillUnmount() {
    this.didFocusListener.remove();
  }

  //  componentWillMount(){
  //   AsyncStorage.getItem("COURSELENGTH")
  //   .then(clength =>{
  //     if(clength == 4) {
  //       this.props.navigation.navigate("MyCourseDetail", {item: this.state.courseid})
  //     } else {
  //       this.fetchCourse();
  //     }
  //   })
  //   this.fetchCourse();
  // }

  

    fetchCourse() {
    AsyncStorage.getItem("user_token")
      .then(token =>{
        // fetchExams(token,this.state.offset).then(data => this.setState({
        //   exams:data.exams,
        //   loading:false,
        //   token:token
        // }));
        fetchMyCourses(token).then(data => {
          this.setState({
          mycourse:data.userProducts,
          loading:false,
          token:token
        })
        console.log("MYCOURSE")
        console.log(this.state.mycourse.length)
        AsyncStorage.setItem('COURSELENGTH', JSON.stringify(this.state.mycourse.length));
        AsyncStorage.getItem("COURSELENGTH")
        .then(clength =>{
          console.log("courseLength " + clength)
      })
        {this.state.mycourse.map((mycourse, index) => {
          console.log("AFTER MAPPING MYCOURSE")
          console.log(mycourse.id)
          //this.checklength();
          this.setState({
            courseid: mycourse.id
          })
          console.log("COURSE ID " + this.state.courseid)
        })
        }
        if(this.state.mycourse.length == 1) {
          this.props.navigation.navigate("MyCourseDetail", {item: this.state.courseid})
          console.log("LENGTH IS ZERO")
        } else {
          console.log("LENGTH IS NOT ZERO")
        }
      });
      })
  }


renderList = ({item,index}) =>{
       return (
        <TouchableOpacity onPress={() => this.props.navigation.navigate("MyCourseDetail", { item: item.id })} style={{ height: heightPercentageToDP(18), width: widthPercentageToDP(30), borderRadius: 4, margin: 5, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
        <View style={{ flex: 1, borderRadius: 10, paddingTop: 0, }}>
          <Image source={{ uri: `${BASE_URL}${item.cover_image}` }} style={{ width: widthPercentageToDP(30), height: heightPercentageToDP(18), }} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', width: widthPercentageToDP(30), height: heightPercentageToDP(18), }} >
            <Text style={{fontFamily:'Roboto-Regular', color: 'white', fontSize: heightPercentageToDP(2), margin: 10, width: 80, position: 'absolute', bottom: 4 }} numberOfLines={2} >
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
          <Header  title="My Courses" />
            {/* <HeadingText text="" /> */}
            {this.state.loading ? <SubjetcLoader /> : (this.state.mycourse.length !==0 ? 
            <FlatList
            ListFooterComponent={this._renderFooter}   
            onEndReachedThreshold={.5}
            onEndReached={this.loadMore}
                style={{flex:1,alignSelf:'center',marginTop:10}}
                numColumns={3}
                data={this.state.mycourse}
                renderItem={this.renderList}
            /> : <BlankError text="Courses not available"/>)}
            
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
