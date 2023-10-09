import React, { Component } from 'react';
import { View, FlatList, TouchableNativeFeedback, Image, AsyncStorage, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';

import { Block, Icon } from 'galio-framework';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import { BLUE, Header, WIDTH } from '../../utils/utils';
import { API_KEY, CHANNEL_ID } from '../../utils/configs';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../../utils/Loader';
import Text from '../components/CustomFontComponent'

export default class PlayList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            videoList: [],
            pageToken: '',
            loadMore: false,
            item: this.props.navigation.state.params.item,
            loading: true
        };
    }

    UNSAFE_componentWillMount() {
        console.log(this.state.item)
        this.fetchVideoList();
    }

    fetchVideoList = async () => {
        // const nextString = `&maxResults=10&order=viewCount&pageToken=CAoQAA&type=video`
        await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?maxResults=10&part=snippet%2CcontentDetails&key=${await AsyncStorage.getItem('youtube_api_key')}&channelId=${await AsyncStorage.getItem('youtube_channelid')}&pageToken=${this.state.pageToken}&playlistId=${this.state.item.id}`)
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
        await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?maxResults=10&part=snippet%2CcontentDetails&key=${await AsyncStorage.getItem('youtube_api_key')}&channelId=${await AsyncStorage.getItem('youtube_channelid')}&pageToken=${this.state.pageToken}&playlistId=${this.state.item.id}`)
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


    render() {
        const renderData = ({ item, index }) => {
            console.log(item)
            return item.snippet == undefined && item.snippet.title == "Private video" ? null : (
                <TouchableOpacity onPress={() => this.props.navigation.navigate("YoutubeVideoPlayer", { item })} >
                    <Block row style={{borderBottomColor:'#ececec',borderBottomWidth:.5}}  >
                        <Block>
                            <Image source={{ uri: item.snippet && item.snippet.thumbnails.medium == undefined ? "" : item.snippet.thumbnails.medium.url }} style={{ backgroundColor: 'lightgrey', width: widthPercentageToDP(20), height: widthPercentageToDP(15), margin: widthPercentageToDP(4), marginVertical: widthPercentageToDP(2), borderRadius: 5 }} />
                        </Block>
                        <Block center left top marginTop={heightPercentageToDP(2)} >
                            <Text style={{ fontSize: heightPercentageToDP(1.8), width: widthPercentageToDP(60), fontFamily: 'Roboto-Bold' }} numberOfLines={1}>{item.snippet.title == undefined ? "" : item.snippet.title}</Text>
                            <Text style={{ fontSize: heightPercentageToDP(1.5), width: widthPercentageToDP(60), lineHeight: heightPercentageToDP(2) }} numberOfLines={2} >{item.snippet.description}</Text>
                            {/* <Text style={{ fontSize: heightPercentageToDP(2) }} >{moment(item.created_at).fromNow()}</Text> */}
                        </Block>
                    </Block>
                </TouchableOpacity>
            )
        }

        return this.state.loading ? <Loader /> : (
            <View style={{flex:1, backgroundColor:'white'}}>
                <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title={this.state.item.snippet.title} />
                <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
                    <Image source={{ uri: `${this.state.item.snippet.thumbnails.high.url}` }} style={{ height: heightPercentageToDP(28), width: WIDTH }} />
                    <LinearGradient colors={["transparent", "black"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
                        <Text style={{ fontSize: heightPercentageToDP(1.8), color: 'white', position: 'absolute', bottom: 20, left: 10, width: widthPercentageToDP(80) }} >{this.state.item.snippet.title}</Text>
                    </LinearGradient>
                </View>
                {/* <Header title={this.state.item.snippet.title} backIcon onBackPress={()=> this.props.navigation.goBack()} /> */}
                <ScrollView>
                {
                    this.state.videoList.length == 0 ? null :
                        <FlatList
                            style={{ backgroundColor: 'white', height: '100%' }}
                            data={this.state.videoList}
                            renderItem={renderData}
                        //onEndReachedThreshold={.5}
                        //onEndReached={this.loadMore}
                        />

                }
            </ScrollView>
            </View>
        );
    }
}
