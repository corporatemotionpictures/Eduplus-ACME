import React, { Component } from 'react';
import { View, Text, FlatList, TouchableNativeFeedback, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Block, Icon } from 'galio-framework';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import { BLUE } from '../../utils/utils';
import { API_KEY, CHANNEL_ID } from '../../utils/configs';

export default class HomeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            videoList: [],
            pageToken: '',
            loadMore: false,
            // item: this.props.route.params.item,
            loading: true,
        };
    }

    UNSAFE_componentWillMount() {
        // console.log(this.state.item)
        this.fetchVideoList();
    }

    fetchVideoList = async () => {
        // const nextString = `&maxResults=10&order=viewCount&pageToken=CAoQAA&type=video`
        await fetch(`https://www.googleapis.com/youtube/v3/playlists?&part=snippet%2CcontentDetails&key=${API_KEY}&channelId=${CHANNEL_ID}&maxResults=10&order=viewCount&pageToken=${this.state.pageToken}&type=video`)
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
        return <Block flex={1} height={heightPercentageToDP("15%")} center ><ActivityIndicator size="large" color={BLUE} /></Block>
    }


    render() {

        const renderData = ({ item, index }) => {
            return item.snippet == undefined ? null : (
                <TouchableOpacity onPress={() => this.props.navigation.navigate("PlayList", { item })} >
                    <Block middle   >
                        <Block>
                            <Image source={{ uri: item.snippet == undefined ? "" : item.snippet.thumbnails.medium.url }} style={{ backgroundColor: 'lightgrey', width: widthPercentageToDP(40), height: widthPercentageToDP(20), margin: widthPercentageToDP(4), marginVertical: widthPercentageToDP(2), borderRadius: 5 }} />
                        </Block>
                        <Block  marginTop={heightPercentageToDP(1)} >
                            <Text style={{ fontSize: heightPercentageToDP(1.8), width: widthPercentageToDP(40), fontWeight: "bold" }} numberOfLines={4}>{item.snippet.title == undefined ? "" : item.snippet.title}</Text>
                            <Text style={{ fontSize: heightPercentageToDP(1.5), width: widthPercentageToDP(40), lineHeight: heightPercentageToDP(2) }} numberOfLines={2} >{item.snippet.description}</Text>
                            {/* <Text style={{ fontSize: heightPercentageToDP(2) }} >{moment(item.created_at).fromNow()}</Text> */}
                        </Block>
                    </Block>
                </TouchableOpacity>
            )

        }


        return this.state.loading ? null : (
            <View>
                {/* <Header title={this.state.item.snippet.title} backIcon onBackPress={()=> this.props.navigation.goBack()} /> */}
                <FlatList
                    horizontal
                    data={this.state.videoList}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderData}
                />
            </View>
        );
    }
}
