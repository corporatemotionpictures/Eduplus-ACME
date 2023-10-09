import React, { Component } from 'react';
import { StyleSheet, View, Animated, Image, Text, FlatList, AsyncStorage, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Header, WIDTH, LIGHTGREY, LIGHT_BLUE } from '../../utils/utils';
import { BASE_URL, fetchChapterSubjectWise } from '../../utils/configs';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../../utils/Loader';
import HeadingText from '../../utils/HeadingText';
import { Avatar } from 'react-native-paper';


export default class SubjectDetails extends Component {
    constructor(props) {
        super(props);
        this._deltaY = new Animated.Value(0);
        this.state = {
            canScroll: false,
            loading: true,
            chapters: [],
            item: this.props.navigation.state.params.item,
            offset: 0,
            last_seen: '',
            loadingMore:true,
            token:''
        };
    }


    componentDidMount() {
        AsyncStorage.getItem("last_seen_chapter").then(last => {
            this.setState({
                last_seen: last,
            })
        })
        AsyncStorage.getItem("user_token").then(token => {
            this.setState({
                token:token
            })
            fetchChapterSubjectWise(token, this.state.offset, this.state.item.id)
                .then(res => {
                    if (res.success) {
                        console.log(res)
                        this.setState({
                            loading: false,
                            chapters: res.chapters,
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
            fetchChapterSubjectWise(this.state.token, this.state.offset, this.state.item.id).then(data => {
          if(data.chapters.length !=0 ){
            
            this.setState({
                chapters:[...this.state.chapters,...data.chapters],
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

        return (
            <TouchableOpacity onPress={() => {
                    AsyncStorage.setItem("last_seen_chapter", item.id.toString()).then(() => {
                     this.props.navigation.navigate("EventList", { item: item })
                    })
            }}>
                <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center',borderBottomColor:'#ececec' ,borderBottomWidth:1 }}>
                    <View style={{ height: widthPercentageToDP(15), width: widthPercentageToDP(20), padding: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                        {/* <Image source={require("../../../../assets/play-button-min.png")} style={{ resizeMode:'center', backgroundColor:'#ececec',height:widthPercentageToDP(10),width:widthPercentageToDP(8) }} /> */}
                        {/* <AntDesign name="profile" size={heightPercentageToDP(5)} /> */}
                        <Avatar.Text label={(index + 1).toString()} labelStyle={{ color: 'white' }} size={heightPercentageToDP(5)} style={{ backgroundColor: this.state.last_seen == item.id ? LIGHT_BLUE : "grey" }} />
                    </View>
                    <View style={{ height: widthPercentageToDP(15), padding: 10, }} >
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
                    {/* <TouchableOpacity style={{height:heightPercentageToDP(8),width:heightPercentageToDP(8),justifyContent:'center',alignItems:'center',position:'absolute',bottom:-heightPercentageToDP(4),right:10,backgroundColor:'white',borderRadius:heightPercentageToDP(4),elevation:5}} >
                                 <Ionicons name="ios-play" color="grey" size={heightPercentageToDP(6)}  />
                    </TouchableOpacity> */}
                </View>
                <View style={{ marginTop: 10 }}>
                </View>
                <HeadingText text={"Chapters in " + this.state.item.name} />
                <FlatList
                    ListFooterComponent={this._renderFooter}   
                    onEndReachedThreshold={.5}
                    onEndReached={this.loadMore} 
                    data={this.state.chapters}
                    renderItem={this.renderData}
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
    },
    placeholder: {
        backgroundColor: '#65C888',
        flex: 1,
        height: 120,
        marginHorizontal: 20,
        marginTop: 20
    }
});