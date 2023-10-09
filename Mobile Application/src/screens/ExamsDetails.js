import React, { Component } from 'react';
import { StyleSheet, View, Animated, Dimensions, Image, Text, FlatList, AsyncStorage, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Header, WIDTH, LIGHTGREY, LIGHT_BLUE } from '../utils/utils';
import { BASE_URL, fetchSingleCourses } from '../utils/configs';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Loader from '../utils/Loader';
import HeadingText from '../utils/HeadingText';
import BlankError from '../utils/BlankError';

const Screen = {
    height: Dimensions.get('window').height
};

export default class ExamDetails extends Component {
    constructor(props) {
        super(props);
        this._deltaY = new Animated.Value(0);
        this.state = {
            canScroll: false,
            loading: true,
            courses: [],
            item: this.props.navigation.state.params.item,
            offset: 0,
            loadingMore: true,
            token: '',
            bookmarks: [],
            bookMarked: false
        };
    }





   async componentWillMount() {
        AsyncStorage.getItem("courses_bookmark").then(res => {
            let bookmarks =  JSON.parse(res)
            console.log(bookmarks)
            this.setState({
                bookmarks: bookmarks == null ? [] : bookmarks,
            });
        });
        AsyncStorage.getItem("user_token").then(token => {
            this.setState({
                token: token
            })
            fetchSingleCourses(token, this.state.offset, this.state.item)
                .then(res => {
                    if (res.success) {
                        this.setState({
                            loading: false,
                            courses: res.courses,
                            loadingMore: false
                        })
                    }
                })
        })
    }



    loadMore = () => {
        this.setState({
            offset: this.state.offset + 10,
            loadingMore: true
        }, () => {
            this.fetchMore()
        })
    }

    fetchMore = () => {
        const offset = this.state.offset
        fetchSingleCourses(this.state.token, offset).then(data => {
            if (data.courses.length != 0) {

                this.setState({
                    courses: [...this.state.courses, ...data.courses],
                    loadingMore: false
                })
            } else {
                this.setState({
                    loadingMore: false
                });
            }
        });
    }

    _renderFooter = () => {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', height: heightPercentageToDP(8) }}>
                {this.state.loadingMore ? <ActivityIndicator size="large" /> : null}
            </View>
        )
    }

    addBookMark = async (item) => {
            if(this.state.bookmarks.includes(item)){
                return;
            } 
            const response = await AsyncStorage.getItem('courses_bookmark');
            const listOfLikes = await JSON.parse(response) || [];
            this.setState({
              bookmarks: listOfLikes
            },() => {
              console.log(this.state.bookmarks)
              if (listOfLikes.includes(item)) {
                this.setState({
                    
                })
              }
              else {
                console.log(listOfLikes)
                this.setState({
                  bookmarks:[...this.state.bookmarks,item]
                })
              }
            });
            AsyncStorage.setItem("courses_bookmark",JSON.stringify(this.state.bookmarks))
          
    }


    renderData = ({ item, index }) => {
        let like
        for (let i = 0; i < this.state.bookmarks.length; i++) {
            const bookmark = this.state.bookmarks[i]
            if(item.id == bookmark.id ){
                like=true
            }else{
                like=false
            }
        }
        console.log(like)

        return (
            <View style={{ flex: 1, width: WIDTH, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', borderBottomColor: "#ececec", borderBottomWidth: 1 }} >
                <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseDetails", { item: item })} style={{ flexDirection: 'row', margin: 5, alignItems: 'center', }}>
                    <View style={{ margin: 5 }}>
                        <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ height: widthPercentageToDP(20), width: widthPercentageToDP(20), borderRadius: widthPercentageToDP(10) }} />
                    </View>
                    <View style={{ height: widthPercentageToDP(20), padding: 5, justifyContent: 'center' }} >
                        <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(2) }} >{item.name}</Text>
                        {/* <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(1.5) }} >{item.exam_name}</Text> */}
                    </View>
                </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.addBookMark(item)} >
                            <MaterialIcons name={ like ? "bookmark" : "bookmark-border"} size={30} color={LIGHT_BLUE} style={{ marginRight: 20 }} />
                        </TouchableOpacity>
                            
                
            </View>
        )
    }

    render() {
        
        return this.state.loading ? <Loader /> : (
            <View style={styles.container}>
                <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title={this.state.item.name} rightIcons={[<MaterialIcons onPress={() => this.props.navigation.navigate("WatchList")} name={"bookmark" } size={20} color={"white"} style={{ right: 18, position: 'absolute' }} />]} />

                <View style={{ backgroundColor: 'white',  }}>

                    <Image source={{ uri: `${BASE_URL}${this.state.item.thumbnail}` }} style={{ height: heightPercentageToDP(30), width: WIDTH }} />
                    <LinearGradient colors={["transparent", "black"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
                        {/* <Text style={{ fontSize: heightPercentageToDP(3), color: 'white', position: 'absolute', bottom: 20, left: 10, width: widthPercentageToDP(80) }} >{this.state.item.name}{"\n\n"}
                            <Text style={{ fontSize: heightPercentageToDP(1.5), color: 'white' }} >{this.state.item.description}</Text>

                        </Text> */}
                    </LinearGradient>
                    <TouchableOpacity style={{ height: heightPercentageToDP(8), width: heightPercentageToDP(8), justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: -heightPercentageToDP(4), right: 10, backgroundColor: 'white', borderRadius: heightPercentageToDP(4), elevation: 5 }} >
                        <Entypo name="open-book" color="grey" size={heightPercentageToDP(3)} />
                    </TouchableOpacity>

                </View>
                <View style={{ marginTop: 10 }}>

                </View>
                <HeadingText text={"Courses of " + this.state.item.name} />
                {
                    this.state.courses.length == 0 ? <BlankError text="Nothing found" /> :
                    <FlatList
                        refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />}
                        ListFooterComponent={this._renderFooter}
                        onEndReachedThreshold={.5}
                        onEndReached={this.loadMore}
                        extraData={this.state}
                        data={this.state.courses}
                        renderItem={this.renderData}
                    />
                }

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