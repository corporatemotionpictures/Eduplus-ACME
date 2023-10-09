import React, { Component } from 'react';
import { Text,View, ScrollView, TouchableNativeFeedback, Share, FlatList, AsyncStorage, ActivityIndicator, Image, TouchableOpacity, StyleSheet } from 'react-native';
// import Header from '../../../../utils/Header';
import WebView from 'react-native-webview';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import { Block } from 'galio-framework';
import LottieView from "lottie-react-native"
import { BLACK_COLOR, BLUE, Header, LIGHTGREY } from '../utils/utils';
import { API_KEY, CHANNEL_ID } from '../utils/configs';
import Loader from '../utils/Loader';
import Orientation from 'react-native-orientation';

const ActivityIndicatorElement = () => {
    return (
      <ActivityIndicator
        color={BLUE_1}
        size="large"
        style={styles.activityIndicatorStyle}
      />
    );
  };

export default class YoutubeLive extends Component {
    constructor(props) {
        super(props);
        this.state = {
            videoData: this.props.navigation.state.params.item,
            videoData1: this.props.navigation.state.params.itemtitle,
            videoData2: this.props.navigation.state.params.itemdesc,
            openDiscription: false,
            videoList: [],
            pageToken: '',
            loadMore: false,
            loading: true,
            visible: true
        }

        console.log(this.state.videoData)
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

    fetchVideoList = async () => {
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


    render() {
      const renderData = ({ item, index }) => {
        return item.snippet && item.snippet.thumbnails == undefined ? null : (
          <TouchableOpacity onPress={() => this.props.navigation.navigate("PlayList", { item: item })} >
              <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center',borderBottomColor:'#ececec',borderBottomWidth:.5 }}>
                  <View style={{ margin: 5 }}>
                      <Image source={{ uri: `${item.snippet.thumbnails.default.url}`}} style={{ height: widthPercentageToDP(20),width: widthPercentageToDP(20), borderRadius: widthPercentageToDP(10) }} />
                  </View>
                  <View style={{ height: widthPercentageToDP(20), padding: 5 ,justifyContent:'center'}} >
                      <Text style={{ fontFamily:'Roboto-Bold', color: LIGHTGREY, fontSize: heightPercentageToDP(1.8) ,width:widthPercentageToDP(60)}} >{item.snippet.title}</Text>
                  </View>
              </View>
          </TouchableOpacity>   
      )
    }
        return (
            this.state.loading ? <Loader /> : (
            <View style={{ flex: 1, backgroundColor:"#ffffff" }}>
                <Header title={"Youtube Live"} backIcon onbackIconPress={() => this.props.navigation.goBack()} />
                <View style={{ width: widthPercentageToDP("100%"), height: heightPercentageToDP("35%"), }}>
                {/* {this.state.videoData.snippet.resourceId.videoId == undefined ? <ActivityIndicator size="large" color={BLUE_1} marginTop={80} /> : */}
                    <WebView
                        style={{ width: widthPercentageToDP("100%"), height: heightPercentageToDP("35%"), }}
                        allowsFullscreenVideo
                        allowsInlineMediaPlayback
                        //renderLoading={ActivityIndicatorElement}
                        javaScriptEnabled={true}
                        onLoadStart={() => (this.showSpinner())}
                        //onLoad={() => this.hideSpinner()}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        source={{ uri: `https://www.youtube.com/embed/${this.state.videoData}` }}
                        //source={{ uri: `https://www.youtube.com/watch?v=HsI4v9_TG6M` }}
                    />
                    {/* {this.state.visible && (
          <ActivityIndicator
            size="large" color={'transparent'} justifyContent = 'center' alignItems='center' top={-120}
          />
        )} */}
                    {/* } */}
                </View>
                <ScrollView>
                  {this.state.videoData1 == undefined || this.state.videoData2 == undefined ? null:
                <Block margin={heightPercentageToDP(2)} marginBottom={1} marginTop={heightPercentageToDP(1)}  >
                        <Text style={{ color:"#000000", fontSize: heightPercentageToDP(2.7), fontFamily: 'Roboto-Bold', fontWeight:'bold' }} >{this.state.videoData1 == undefined ? "" : this.state.videoData1}</Text>
                        <Text numberOfLines={this.state.openDiscription ? null : 3} onPress={() => this.setState({ openDiscription: !this.state.openDiscription })} style={{ fontSize: heightPercentageToDP(1.5), lineHeight: heightPercentageToDP(2), marginTop: 5 }} >{this.state.videoData2}</Text>
                    </Block>
                  }
                    <View
                        style={{
                        borderBottomColor: "#DCDCDC",
                        borderBottomWidth: .2,
                        marginTop: 10
                        }}
                    />
                    <Text style={{ backgroundColor: '#ffffff', padding: heightPercentageToDP(1.5), fontWeight:'bold', color: 'black', paddingLeft: heightPercentageToDP(2), }}>
                        Suggested Videos
                       </Text>
                       {/* <View
                        style={{
                        borderBottomColor: "#DCDCDC",
                        borderBottomWidth: .2,
                        marginTop: 1
                        }}
                    /> */}
                    {this.state.videoList.length == 0 ? null :
                        <FlatList
                            style={{backgroundColor:'white', height:'100%'}}
                            data={this.state.videoList}
                            renderItem={renderData}
                            onEndReachedThreshold={.5}
                            //onEndReached={this.loadMore}
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