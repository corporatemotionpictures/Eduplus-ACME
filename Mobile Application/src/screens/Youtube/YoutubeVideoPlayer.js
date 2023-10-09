import React, { Component } from 'react';
import { View, ScrollView, TouchableNativeFeedback, AsyncStorage, Share, FlatList, ActivityIndicator, Image, TouchableOpacity, StyleSheet } from 'react-native';
// import Header from '../../../../utils/Header';
import WebView from 'react-native-webview';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import { Block } from 'galio-framework';
import LottieView from "lottie-react-native"
import { BLACK_COLOR, BLUE, Header } from '../../utils/utils';
import { API_KEY, CHANNEL_ID } from '../../utils/configs';
import Text from '../components/CustomFontComponent'
import Loader from '../../utils/Loader';

const ActivityIndicatorElement = () => {
    return (
      <ActivityIndicator
        color={BLUE_1}
        size="large"
        style={styles.activityIndicatorStyle}
      />
    );
  };

export default class YoutubeVideoPlayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            videoData: this.props.navigation.state.params.item,
            openDiscription: false,
            videoList: [],
            pageToken: '',
            loadMore: false,
            loading: true,
            visible: true

        }
    }

    hideSpinner=()=> {
        this.setState({ visible: false });
      }
      showSpinner=()=> {
        this.setState({ visible: true });
      }


    UNSAFE_componentWillMount() {
        this.fetchVideoList();
        //this.fetchComments();
    }

    // fetchComments = async () => {
    //     await fetch(`https://www.googleapis.com/youtube/v3/comments?maxResults=10&part=snippet%2CcontentDetails&key=${API_KEY}&channelId=${CHANNEL_ID}&id=${this.state.videoData.snippet.playlistId}`)
    //         .then(res => res.json())
    //         .then(res => {
    //             console.log(res)
    //             this.setState({
    //                 loading: false
    //             });
    //         })
    //         .catch(error => 
    //             alert(error),
    //             //console.log(error)
    //             )
    //         console.log("ERROR MESSAGE one >>>>>>>>>>>>>>>>")
    // }


    fetchVideoList = async () => {
        // alert(this.state.videoData.snippet.playlistId)
        // console.log(this.state.videoData.snippet.playlistId)
        // const nextString = `&maxResults=10&order=viewCount&pageToken=CAoQAA&type=video`
        await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?maxResults=10&part=snippet%2CcontentDetails&key=${await AsyncStorage.getItem('youtube_api_key')}&channelId=${await AsyncStorage.getItem('youtube_channelid')}&pageToken=${this.state.pageToken}&playlistId=${this.state.videoData.snippet.playlistId}`)
            .then(res => res.json())
            .then(res => {
                //alert(JSON.stringify(res))
                this.setState({
                    videoList: res.items,
                    pageToken: res.nextPageToken,
                    loading: false
                });
            })
            .catch((error) => 
            console.log(error))
            //console.log("ERROR MESSAGE two >>>>>>>>>>>>>>>>")
    };

    fetchMore = async () => {
        await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?maxResults=10&part=snippet%2CcontentDetails&key=${await AsyncStorage.getItem('youtube_api_key')}&channelId=${await AsyncStorage.getItem('youtube_channelid')}&pageToken=${this.state.pageToken}&playlistId=${this.state.item.videoData.playlistId}`)
            .then(res => res.json())
            .then(res => {
                this.setState({
                    videoList: [...this.state.videoList, ...res.items],
                    pageToken: res.nextPageToken
                });
            })
            .catch(error => console.log(error))
            console.log("ERROR MESSAGE three >>>>>>>>>>>>>>>>")
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

    render() {
        const renderData = ({ item, index }) => {
            // console.log("ITEM VIDEO LIST NAME")
            // console.log(item)
            return item.snippet == undefined || item.snippet.title == "Private video" ? null : (
                <TouchableOpacity onPress={() => this.props.navigation.push("YoutubeVideoPlayer", {item })} >
                    <Block row style={{borderBottomColor:'#ececec',borderBottomWidth:.5}}  >
                        <Block>
                        <Image source={{ uri: item.snippet && item.snippet.thumbnails.medium == undefined ? "" : item.snippet.thumbnails.medium.url }} style={{ backgroundColor: 'lightgrey', width: widthPercentageToDP(20), height: widthPercentageToDP(15), margin: widthPercentageToDP(4), marginVertical: widthPercentageToDP(2), borderRadius: 5 }} />
                            {/* <Image source={{ uri: item.snippet.thumbnails.default.url == undefined ? "" : item.snippet.thumbnails.default.url }} style={{ backgroundColor: 'lightgrey', width: widthPercentageToDP(20), height: widthPercentageToDP(15), margin: widthPercentageToDP(4), marginVertical: widthPercentageToDP(2), borderRadius: 5 }} /> */}
                        </Block>
                        <Block center left top marginTop={heightPercentageToDP(2)} >
                            <Text style={{ fontSize: heightPercentageToDP(1.8), width: widthPercentageToDP(60), fontFamily:'Roboto-Bold' }} numberOfLines={1}>{item.snippet.title == undefined ? "" : item.snippet.title}</Text>
                            <Text style={{ fontSize: heightPercentageToDP(1.5), width: widthPercentageToDP(60), lineHeight: heightPercentageToDP(2) }} numberOfLines={2} >{item.snippet.description}</Text>
                            {/* <Text style={{ fontSize: heightPercentageToDP(2) }} >{moment(item.created_at).fromNow()}</Text> */}
                        </Block>
                    </Block>
                </TouchableOpacity>
            )
        }


        return (
            this.state.loading ? <Loader /> : (
            <View style={{ flex: 1 }}>
                <Header title={this.state.videoData.snippet.title == undefined ? "" : this.state.videoData.snippet.title} backIcon onbackIconPress={() => this.props.navigation.goBack()} />
                <View style={{ width: widthPercentageToDP("100%"), height: heightPercentageToDP("30%"), }}>
                {/* {this.state.videoData.snippet.resourceId.videoId == undefined ? <ActivityIndicator size="large" color={BLUE_1} marginTop={80} /> : */}
                    <WebView
                        style={{ width: widthPercentageToDP("100%"), height: heightPercentageToDP("30%"), }}
                        allowsFullscreenVideo
                        allowsInlineMediaPlayback
                        //renderLoading={ActivityIndicatorElement}
                        javaScriptEnabled={true}
                        onLoadStart={() => (this.showSpinner())}
                        //onLoad={() => this.hideSpinner()}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        source={{ uri: `https://www.youtube.com/embed/${this.state.videoData.snippet.resourceId.videoId}` }}
                    />
                    {this.state.visible && (
          <ActivityIndicator
            // style={{
            // flex: 1,
            // left: 0,
            // right: 0,
            // top: 0,
            // bottom: 0,
            // position: 'absolute',
            // alignItems: 'center',
            // justifyContent: 'center' }}
            // size="large"
            size="large" color={'transparent'} justifyContent = 'center' alignItems='center' top={-120}
          />
        )}
                    {/* } */}
                </View>
                <ScrollView>
                    <Block margin={heightPercentageToDP(2)} marginBottom={2} marginTop={heightPercentageToDP(1)}  >
                        <Text style={{ color:BLACK_COLOR, fontSize: heightPercentageToDP(2.5), fontFamily: 'Roboto-Bold', }} >{this.state.videoData.snippet.title == undefined ? "" : this.state.videoData.snippet.title}</Text>
                        <Text numberOfLines={this.state.openDiscription ? null : 3} onPress={() => this.setState({ openDiscription: !this.state.openDiscription })} style={{ fontSize: heightPercentageToDP(1.5), lineHeight: heightPercentageToDP(2), marginTop: 5 }} >{this.state.videoData.snippet.description}</Text>
                    </Block>

                    <View
                        style={{
                        borderBottomColor: "#DCDCDC",
                        borderBottomWidth: .2,
                        marginTop: 10
                        }}
                    />
                    
                    <Text style={{ backgroundColor: '#ffffff', padding: heightPercentageToDP(1.5), color: 'black', paddingLeft: heightPercentageToDP(2) }}>
                        Suggested Videos
                       </Text>
                    {this.state.videoList.length == 0 ? null :
                        <FlatList
                            style={{backgroundColor:'white', height:'100%'}}
                            data={this.state.videoList}
                            renderItem={renderData}
                            onEndReachedThreshold={.5}
                            onEndReached={this.loadMore}
                        />}

                </ScrollView>
            </View>
            )
        );
    }
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#F5FCFF',
      flex: 1,
    },
    activityIndicatorStyle: {
      flex: 1,
      justifyContent: 'center',
    },
  });