
import React, { Component } from 'react';
import { StyleSheet, View, Animated, ScrollView, Dimensions, AsyncStorage, Image, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Header, LIGHTGREY, BLUE, WIDTH } from '../../utils/utils';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { API_KEY, CHANNEL_ID } from '../../utils/configs';
import { Block } from 'galio-framework';
import Loader from '../../utils/Loader';

const Screen = {
    height: Dimensions.get('window').height
};

export default class YoutubeHome extends Component {
    constructor(props) {
        super(props);
        this._deltaY = new Animated.Value(0);
        this.state = {
            canScroll: false,
            loading: true,
            subjects: [],
            item: {},
            offset: 0,
            loadingMore: true,
            token: '',
            packageLocked: false,
            videoList: [],
            pageToken: '',
            loadMore: false,
        };
    }

    async UNSAFE_componentWillMount() {
        // console.log(this.state.item)
        this.fetchVideoList();
    }

    fetchVideoList = async () => {
        // const nextString = `&maxResults=10&order=viewCount&pageToken=CAoQAA&type=video`
        await fetch(`https://www.googleapis.com/youtube/v3/playlists?&part=snippet%2CcontentDetails&key=${await AsyncStorage.getItem('youtube_api_key')}&channelId=${await AsyncStorage.getItem('youtube_channelid')}&maxResults=10&order=viewCount&pageToken=${this.state.pageToken}&type=video`)
            .then(res => res.json())
            .then(res => {
                console.log(res)
                this.setState({
                    videoList: res.items,
                    pageToken: res.nextPageToken,
                    loading: false
                });
            })
            .catch(error => console.log(error))
    };

    fetchMore = async () => {
        await fetch(`https://www.googleapis.com/youtube/v3/playlists?&part=snippet%2CcontentDetails&key=${await AsyncStorage.getItem('youtube_api_key')}&channelId=${await AsyncStorage.getItem('youtube_channelid')}&maxResults=10&order=viewCount&pageToken=${this.state.pageToken}&type=video`)
            .then(res => res.json())
            .then(res => {
                this.setState({
                    videoList: [...this.state.videoList, ...res.items],
                    pageToken: res.nextPageToken
                });
            })
            .catch(error => console.log(error))
    };



    loadMore = () => {
        this.setState({
            loadMore: true
        }, () => {
            this.fetchMore()
        })
    }

    _renderFooter = () => {
        return <Block flex={1} height={heightPercentageToDP("15%")} center ><ActivityIndicator size="large" color={BLUE} /></Block>
    }

    renderData = ({ item, index }) => {
        return item.snippet && item.snippet.thumbnails == undefined ? null : (
            <TouchableOpacity onPress={() => this.props.navigation.navigate("PlayList", { item: item })} >
                <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center', borderBottomColor: '#ececec', borderBottomWidth: .5 }}>
                    <View style={{ margin: 5 }}>
                        <Image source={{ uri: `${item.snippet.thumbnails.default.url}` }} style={{ height: widthPercentageToDP(20), width: widthPercentageToDP(20), borderRadius: widthPercentageToDP(10) }} />
                    </View>
                    <View style={{ height: widthPercentageToDP(20), padding: 5, justifyContent: 'center' }} >
                        <Text style={{ fontFamily: 'Roboto-Bold', color: LIGHTGREY, fontSize: heightPercentageToDP(1.8), width: widthPercentageToDP(60) }} >{item.snippet.title}</Text>
                        {/* <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(1.5) }} >{item.description}</Text> */}
                        {/* <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(1.5), fontFamily:'Roboto-Bold' }} >{item.exam_name}</Text> */}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return this.state.loading ? <Loader /> : (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <Header onbackIconPress={() => this.props.navigation.goBack()} backIcon title={"ACME Academy Free Videos"} />
                <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
                    <Image source={require("../../../assets/youtubebanner.jpg")} style={{ width: "100%", marginBottom: -40, resizeMode: 'contain', marginTop: -40 }} />
                </View>
                {/* <Header title={this.state.item.snippet.title} backIcon onBackPress={()=> this.props.navigation.goBack()} /> */}
                <ScrollView>
                    {this.state.videoList == undefined || this.state.videoList.length == 0 ? null :
                        <FlatList
                            style={{ backgroundColor: 'white', height: "100%" }}
                            data={this.state.videoList}
                            renderItem={this.renderData}
                            onEndReachedThreshold={.5}
                            onEndReached={this.loadMore}
                        // ListFooterComponent={this._renderFooter}             
                        />
                    }
                </ScrollView>
            </View>
        );
        // (<View>
        //     <Header onbackIconPress={() => this.props.navigation.goBack()} backIcon  title={"ACME Academy Free Videos"} />
        //     <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
        //         <Image source={require("../../../assets/youtubebanner.jpg")} style={{ width: "100%", marginBottom:-46, resizeMode:'contain', marginTop:-46 }} />
        //     </View>
        //     {
        //          this.state.videoList.length == 0 ?
        //          <View style={{marginTop:200}}>
        //           <BlankError text={`Free Videos not available`} /> 
        //           </View>
        //           :
        //             <FlatList
        //                 style={{backgroundColor:'white', height:"100%"}}
        //                 data={this.state.videoList}
        //                 renderItem={this.renderData}
        //                 onEndReachedThreshold={.5}
        //                 onEndReached={this.loadMore}
        //             // ListFooterComponent={this._renderFooter}             
        //             />
        //     }
        // </View>)
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
        backgroundColor: 'white'
    },
    placeholder: {
        backgroundColor: '#65C888',
        flex: 1,
        height: 120,
        marginHorizontal: 20,
        marginTop: 20
    }
});