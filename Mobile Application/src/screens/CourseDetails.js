import React, { Component } from 'react';
import { StyleSheet, View, Animated, Dimensions, Image, FlatList, AsyncStorage, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Header, WIDTH, LIGHTGREY, BLUE } from '../utils/utils';
import { BASE_URL, fetchSubject } from '../utils/configs';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Loader from '../utils/Loader';
import BlankError from '../utils/BlankError';
import AwesomeAlert from 'react-native-awesome-alerts';
import Text from './components/CustomFontComponent';

const Screen = {
    height: Dimensions.get('window').height
};

export default class CoursesDetails extends Component {
    constructor(props) {
        super(props);
        this._deltaY = new Animated.Value(0);
        this.state = {
            canScroll: false,
            loading: true,
            subjects: [],
            item: this.props.navigation.state.params.item,
            offset: 0,
            loadingMore:true ,
            token:'',
            packageLocked:false
        };
    }


    componentDidMount() {
        AsyncStorage.getItem("user_token").then(token => {
            this.setState({
                token:token
            })
            fetchSubject(this.state.item.id, token, this.state.offset,)
                .then(res => {
                    if (res.success) {
                        console.log(res)
                        this.setState({
                            loading: false,
                            subjects: res.subjects,
                            loadingMore:false
                        })
                    }
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
            fetchSubject(this.state.item.id, this.state.token, this.state.offset,).then(data => {
          if(data.subjects.length !=0 ){
            
            this.setState({
                subjects:[...this.state.subjects,...data.subjects],
              loadingMore:false
            })
          }else{
            this.setState({
              loadingMore:false
            });
          }
          }); 
        }
      
        _renderFooter =  () =>{
            return (
                <View style={{justifyContent:'center',alignItems:'center',height:heightPercentageToDP(8)}}>
                        { this.state.loadingMore ?  <ActivityIndicator size="large" /> : null }
                </View>
            )
        }


    renderData = ({ item, index }) => {
        return item.locked ?
        (
            <TouchableOpacity onPress={() => this.setState({packageLocked:true})} >
                <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center',borderBottomColor:'#ececec',borderBottomWidth:.5 }}>
                    <View style={{ margin: 5,borderRadius: widthPercentageToDP(10),overflow:'hidden',justifyContent:'center',alignItems:'center' }}>
                        <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ height: widthPercentageToDP(20), width: widthPercentageToDP(20), borderRadius: widthPercentageToDP(10) }} />
                        <View style={{backgroundColor:'black',opacity:.3,position:'absolute',top:0,left:0,bottom:0,right:0,justifyContent:'center',alignItems:'center'}}>                       
                          <AntDesign name="lock1" size={heightPercentageToDP(5)} color="white"  />
                        </View>
                        <View style={{position:'absolute',top:0,left:0,bottom:0,right:0,justifyContent:'center',alignItems:'center'}}>                       
                          <AntDesign name="lock1" size={heightPercentageToDP(5)} color="white"  />
                        </View>
                    </View>
                    <View style={{ height: widthPercentageToDP(20), padding: 5,justifyContent:'center' }} >
                        <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(2),width:widthPercentageToDP(60) }} >{item.name}</Text>
                        <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(1.5),width:widthPercentageToDP(60) }} >{item.course_name}</Text>
                        <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(1.5), fontFamily:'Roboto-Bold',width:widthPercentageToDP(60) }} >{item.exam_name}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
        :
        (
            <TouchableOpacity onPress={() => this.props.navigation.navigate("SubjectDetails", { item: item })} >
                <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center',borderBottomColor:'#ececec',borderBottomWidth:.5 }}>
                    <View style={{ margin: 5 }}>
                        <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ height: widthPercentageToDP(20), width: widthPercentageToDP(20), borderRadius: widthPercentageToDP(10) }} />
                    </View>
                    <View style={{ height: widthPercentageToDP(20), padding: 5 ,justifyContent:'center'}} >
                        <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(2) }} >{item.name}</Text>
                        <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(1.5) }} >{item.course_name}</Text>
                        <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(1.5), fontFamily:'Roboto-Bold' }} >{item.exam_name}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }



    render() {
        return this.state.loading ? <Loader /> : (
            <View style={styles.container}>
                <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title={this.state.item.name} />

                <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
                    <Image source={{ uri: `${BASE_URL}${this.state.item.thumbnail}` }} style={{ height: heightPercentageToDP(30), width: WIDTH }} />
                    <LinearGradient colors={["transparent", "black"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
                        <Text style={{ fontSize: heightPercentageToDP(3), color: 'white', position: 'absolute', bottom: 20, left: 10 }} >{this.state.item.name}</Text>
                    </LinearGradient>
                </View>
                <View style={{ marginTop: 0 }}>

                </View>
                {/* <HeadingText text={"Subjects in " + this.state.item.name} /> */}
                    {this.state.subjects.length == 0 ? <BlankError text="Nothing found" /> : <FlatList
                    refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />}
                    ListFooterComponent={this._renderFooter}   
                    onEndReachedThreshold={.5}
                    onEndReached={this.loadMore} 
                    data={this.state.subjects}
                    renderItem={this.renderData}
                />}

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
    onSnap(event) {
        const { id } = event.nativeEvent;
        if (id === 'bottom') {
            //   this.setState({ canScroll: true });
        }
    }
    onScroll(event) {
        const { contentOffset } = event.nativeEvent;
        if (contentOffset.y <= 0) {
            this.setState({ canScroll: false });
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white'
    },
    placeholder: {
        backgroundColor: '#65C888',
        flex: 1,
        height: 120,
        marginHorizontal: 20,
        marginTop: 20
    },
    name:{
        fontSize:28,
        color:"#696969",
        fontFamily:'Roboto-Bold'
      },
      price:{
        marginTop:10,
        fontSize:18,
        color:"green",
        fontFamily:'Roboto-Bold'
      },
      description:{
        textAlign:'center',
        marginTop:10,
        color:"#696969",
      },
});