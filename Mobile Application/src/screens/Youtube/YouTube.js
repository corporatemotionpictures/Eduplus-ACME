import React, { Component } from 'react';
import { View, Text, FlatList, TouchableNativeFeedback, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { API_KEY, CHANNEL_ID } from '../../../../utils/config';

import { Block, Icon } from 'galio-framework';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import { BLUE_2, BLUE_1 } from '../../../../utils/utils';
import LinearGradient from "react-native-linear-gradient";
import Loader from '../../../../utils/Loader';

export default class PlayList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            videoList: [],
            pageToken: '',
            loadMore: false,
            loading:true
        };
    }

    UNSAFE_componentWillMount() {
        this.fetchPlaylistData();
    }

    fetchPlaylistData = async () => {

        await fetch(`https://www.googleapis.com/youtube/v3/playlists?&part=snippet%2CcontentDetails&key=${API_KEY}&channelId=${CHANNEL_ID}&maxResults=10&order=viewCount&pageToken=${this.state.pageToken}&type=video`)
            .then(res => res.json())
            .then(res => {
                this.setState({
                    videoList: res.items,
                    pageToken: res.nextPageToken,
                    loading:false
                });
            })
            .catch(error => console.log(error))
        let url = `https://www.googleapis.com/youtube/v3/playlists?&part=snippet%2CcontentDetails&key=${API_KEY}&channelId=${CHANNEL_ID}&maxResults=10&order=viewCount&pageToken=${this.state.pageToken}&type=video`
    
    };

    fetchMore = async () => {
        await fetch(`https://www.googleapis.com/youtube/v3/playlists?&part=snippet%2CcontentDetails&key=${API_KEY}&channelId=${CHANNEL_ID}&maxResults=10&order=viewCount&pageToken=${this.state.pageToken}&type=video`)
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
        return <Block flex={1} height={heightPercentageToDP("15%")} center ><ActivityIndicator size="large" color={BLUE_2} /></Block>
    }


    render() {

        const renderData = ({ item, index }) => {
            console.log(item.snippet.thumbnails.default.urls)
            return item.snippet == undefined ? null : (
                <TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate("VideoList", { item })} style={{ justifyContent: 'center', alignItems: 'center', width: widthPercentageToDP(43), margin: widthPercentageToDP(4), marginBottom: widthPercentageToDP(10) }} >
                        <Image source={{ uri: item.snippet == undefined ? "" : item.snippet.thumbnails.medium.url }} style={{ width: widthPercentageToDP("43%"), height: heightPercentageToDP("12%"), resizeMode: "cover", borderRadius: widthPercentageToDP(2), }} />
                        <LinearGradient colors={["transparent", "black"]} style={{ width: widthPercentageToDP("43%"), height: heightPercentageToDP("12%"), opacity: .6, borderRadius: widthPercentageToDP(2), position: 'absolute' }} >
                        </LinearGradient>
                        <Text style={{ color: 'white', fontSize: heightPercentageToDP(2), position: 'absolute', left: 10, bottom: 10, }} ><Icon name="play" family="AntDesign" color={"white"} size={heightPercentageToDP(2)} />  {item.contentDetails.itemCount} Videos</Text>
                    </TouchableOpacity>
                    <View style={{ position: 'absolute', bottom: 18, left: 18 }} >
                        <Text numberOfLines={2} style={{ fontSize: heightPercentageToDP(2), color: 'black', textTransform: 'capitalize', width: widthPercentageToDP(40),fontFamily:'Roboto-Bold' }} >{item.snippet.title} </Text>
                    </View>
                </TouchableOpacity>

            )
        }

        return this.state.loading ? <Loader /> : (
            <ScrollView>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Block center style={{marginTop:10}}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("VideoList", { item:this.state.videoList[5] })}><Image  source={{ uri: this.state.videoList[5].snippet == undefined ? "" : this.state.videoList[5].snippet.thumbnails.maxres.url }} style={{ width: widthPercentageToDP("90%"), height: heightPercentageToDP("20%"), resizeMode: "cover", borderRadius: widthPercentageToDP(2), }} /></TouchableOpacity>
            </Block>
                {
                    this.state.videoList.length == 0 ? null : <FlatList
                        data={this.state.videoList}
                        renderItem={renderData}
                        onEndReachedThreshold={.5}
                        onEndReached={this.loadMore}
                        // ListFooterComponent={this._renderFooter}
                        numColumns={2}
                    />
                }
            </View>
            </ScrollView>
        );
    }
}
