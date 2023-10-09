import React, { Component } from 'react';
import { StyleSheet, View, Animated, Image, Text, FlatList, AsyncStorage, TouchableOpacity, ActivityIndicator,RefreshControl } from 'react-native';
import { Header, WIDTH, LIGHTGREY, LIGHT_BLUE } from '../../utils/utils';
import { BASE_URL, fetchVideo, fetchLiveEvents } from '../../utils/configs';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loader from '../../utils/Loader';
import HeadingText from '../../utils/HeadingText';


export default class EventList extends Component {
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
            loadingMore: false,
            token: '',
            refreshing:false
        };
    }


    componentDidMount() {
        AsyncStorage.getItem("last_seen_lecture").then(last => {
            this.setState({
                last_seen: last
            })
        })
        AsyncStorage.getItem("user_token").then(token => {
            this.setState({
                token: token,
                offset:0
            })
            fetchLiveEvents(this.state.item.id, token, this.state.offset)
                .then(res => {
                    if (res.success) {
                        console.log(res)
                        this.setState({
                            loading: false,
                            chapters: res.events,
                            refreshing:false
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
        fetchVideo(this.state.item.id, this.state.token, this.state.offset).then(data => {
            if (data.videos.length != 0) {
                this.setState({
                    chapters: [...this.state.chapters, ...data.videos],
                    loadingMore: false
                })
            } else {
                this.setState({
                    loadingMore: false
                })
            }
        });
    }


    renderData = ({ item, index }) => {
        const getMinutesFromSeconds = (time) => {
            const minutes = time >= 60 ? Math.floor(time / 60) : 0;
            const seconds = Math.floor(time - minutes * 60);

            return `${minutes >= 10 ? minutes : '0' + minutes}:${seconds >= 10 ? seconds : '0' + seconds
                }`;
        }
        return (
            <TouchableOpacity onPress={() => {
                item.locked ? null :
                AsyncStorage.setItem("last_seen_lecture", item.id.toString()).then(() => {
                    this.props.navigation.navigate("LivePlayer", { item: item })
                })
            }} >
                <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center', }}>
                    <View style={{ margin: 5, height: widthPercentageToDP(15), width: widthPercentageToDP(20), padding: 10, borderRadius: 10, }}>
                        {/* <Image source={require("../../../../assets/play-button-min.png")} style={{ resizeMode:'center', backgroundColor:'#ececec',height:widthPercentageToDP(10),width:widthPercentageToDP(8) }} /> */}
                        <AntDesign name={item.locked ? "lock" : "play"} color={this.state.last_seen == item.id ? LIGHT_BLUE : "grey"} size={heightPercentageToDP(5)} />
                    </View>
                    <View style={{ height: widthPercentageToDP(15), padding: 5 }} >
                        <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(2) }} >{item.title}</Text>
                        <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(1.5) }} >{item.course_name}</Text>
                        <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(1.5), fontFamily:'Roboto-Bold' }} >{getMinutesFromSeconds(item.duration)}</Text>
                    </View>
                </View>


            </TouchableOpacity>
        )
    }


    _renderFooter = () => {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', height: heightPercentageToDP(8) }}>
                { this.state.loadingMore ? <ActivityIndicator size="large" /> : null}
            </View>
        )
    }

    refresh=() =>{
        this.setState({
            refreshing:true
        });
        this.componentDidMount();
    }

    render() {
        console.log(`${BASE_URL}${this.state.item.thumbnail}`)
        return this.state.loading ? <Loader /> : (
            <View style={styles.container}>
                <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title={this.state.item.name} />

                <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
                    <Image source={require("../../../assets/playlist.jpg")} style={{ height: heightPercentageToDP(30), width: WIDTH }} />
                    <LinearGradient colors={["transparent", "black"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
                        <Text style={{ fontSize: heightPercentageToDP(3), color: 'white', position: 'absolute', bottom: 20, left: 10 }} >{this.state.item.name}</Text>
                    </LinearGradient>
                    <TouchableOpacity style={{ height: heightPercentageToDP(8), width: heightPercentageToDP(8), justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: -heightPercentageToDP(4), right: 10, backgroundColor: 'white', borderRadius: heightPercentageToDP(4), elevation: 5 }} >
                        <Ionicons name="ios-play" color="grey" size={heightPercentageToDP(6)} />
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 10 }}>
                </View>
                <HeadingText text={"Lectures "} />
                <FlatList
                    refreshControl={<RefreshControl  refreshing={this.state.refreshing} onRefresh={this.refresh}  />}
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