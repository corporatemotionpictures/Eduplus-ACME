import React, { Component } from 'react';
import { View, Text, FlatList, ScrollView, AsyncStorage, Image, TouchableOpacity } from 'react-native';
import { styles, Header, LIGHTGREY, WIDTH, BLUE, GREEN, LIGHT_GREEN } from '../../utils/utils';
import List from '../../utils/List';
import { fetchVideo, BASE_URL } from '../../utils/configs';
import HeadingText from '../../utils/HeadingText';
import Loader from '../../utils/Loader';
import BlankError from '../../utils/BlankError';
import Background from '../../utils/Background';
import QuoteLoader from '../../utils/QuoteLoader';
import LinearGradient from "react-native-linear-gradient"
import { AntDesign, Ionicons, Foundation } from "@expo/vector-icons"
import { heightPercentageToDP, heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AwesomeAlert from "react-native-awesome-alerts"


export default class VideoList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: [],
      chapterID: this.props.navigation.state.params.item.id,
      title: this.props.navigation.state.params.item.name,
      loading: true,
      token: '',
      loadingMore: false,
      offset: 0,
      lockedMessage: false
    };
  }


  componentDidMount() {
    AsyncStorage.getItem("user_token").then((token) => {
      console.log(this.state.title)
      fetchVideo(this.state.chapterID, token, this.state.offset).then((data) => {
        if (data.success) {
          this.setState({
            videos: data.videos,
            loading: false,
            token: token
          })
        } else {
          this.setState({
            loading: false,
            token: token
          })
        }
        console.log(data)
      });
    })
  }

  renderList = ({ item, index }) => {
    const getMinutesFromSeconds = (time) => {
      const minutes = time >= 60 ? Math.floor(time / 60) : 0;
      const seconds = Math.floor(time - minutes * 60);

      return `${minutes >= 10 ? minutes : '0' + minutes}:${seconds >= 10 ? seconds : '0' + seconds
        }`;
    }


    return item.locked ? (
      <TouchableOpacity onPress={() => this.setState({ lockedMessage: true })} style={{ flexDirection: 'row', justifyContent: 'space-between', width: hp("22%"), borderBottomColor: "#ececec", borderBottomWidth: .5 }}>
        <View style={{ height: hp("10%"), width: hp("20%"), borderRadius: 10, margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
          <View style={{ flex: 1, height: hp("10"), width: hp("20%"), borderRadius: 10, }}>
            <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ height: hp("10"), width: hp("20%") }} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: hp("10"), width: hp("20%") }} >
              <Text numberOfLines={2} style={{ color: 'white', fontSize: hp("1"), margin: hp("1.2"), width: hp("12%"), position: 'absolute', bottom: hp(2) }}>
                {/* {item.title} */}
              </Text>
            </LinearGradient>
          </View>
          <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require("../../../assets/play-button-min.png")} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
          </View>
        </View>
        <View style={{ margin: 5, padding: 10, width: wp("60%"), justifyContent: 'space-between' }}>
          <Text style={{ color: "black", fontSize: hp("1.6%"), width: WIDTH / 2 }} numberOfLines={2}>{item.title}</Text>
          <Text style={{ color: "black", width: WIDTH / 2, fontSize: hp("1.5%") }} numberOfLines={1}><AntDesign name="clockcircleo" size={hp("1.5%")} color={"black"} />  {getMinutesFromSeconds(item.duration)}</Text>
        </View>
      </TouchableOpacity>
    )
      :
      <TouchableOpacity onPress={() => this.props.navigation.navigate("VideoPlayer", { item: item })} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomColor: "#ececec", borderBottomWidth: .5 }}>
        <View style={{ height: hp("10%"), width: hp("20%"), borderRadius: heightPercentageToDP(.7), margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
          <View style={{ flex: 1, height: hp("10"), width: hp("20%"), borderRadius: heightPercentageToDP(.7) }}>
            <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ height: hp("10"), width: hp("20%") }} />
            {/* <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: hp("10"), width: hp("20%") }} >
            </LinearGradient> */}
          </View>
          <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require("../../../assets/play-button-min.png")} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
          </View>
        </View>
        <View style={{ margin: 5, padding: 10, width: wp("60%"), justifyContent: 'space-between' }}>
          <Text style={{ color: "black", fontSize: hp("2%"), width: WIDTH / 2, fontFamily: 'Roboto-Bold' }} numberOfLines={2}>{item.title}</Text>
          <Text style={{ color: "black", width: WIDTH / 2, fontSize: hp("1.5%") }} numberOfLines={1}><AntDesign name="clockcircleo" size={hp("1.5%")} color={"black"} />  {getMinutesFromSeconds(item.duration)}</Text>
        </View>
      </TouchableOpacity>
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
    console.log(offset)
    fetchVideo(this.state.chapterID, this.state.token, offset).then(data => {
      if (data.videos.length != 0) {
        this.setState({
          videos: [...this.state.videos, ...data.videos],
          loadingMore: false
        })
      } else {
        this.setState({
          loadingMore: false
        })
      }
    });
  }


  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* <Background /> */}
        <Header backIcon={true} onbackIconPress={() => this.props.navigation.goBack()} title={this.state.title} rightIcon="" />

        {this.state.loading ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Loader /></View> : (this.state.videos.length !== 0 ?
          <FlatList
            ListFooterComponent={this._renderFooter}
            onEndReachedThreshold={.5}
            onEndReached={this.loadMore}
            style={{ flex: 1, marginTop: heightPercentageToDP(.8) }}
            data={this.state.videos}
            renderItem={this.renderList}
          /> : <BlankError text="Videos not found" />)}

        <View style={{ position: 'absolute', bottom: hp("2"), left: 0, right: 0, height: hp("10"), justifyContent: 'center', alignItems: "center" }}>
          <View style={{ backgroundColor: GREEN, padding: hp("2"), width: "90%", borderRadius: hp(".7"), alignItems: 'center', flexDirection: 'row', }}>
            <Foundation name="alert" size={hp("2.4")} color="white" />
            <Text style={{ color: 'white', fontSize: hp("1.1"), marginLeft: wp("2") }}>
              View Count Alert:{"\n"}One view will be deducted once you open a video lecture.
            </Text>
          </View>
        </View>
        <AwesomeAlert
          show={this.state.lockedMessage}
          showProgress={false}
          title={`Limit Exhausted`}
          message={`Your have reached your video view thresold,Please Contact ACME Academy for More Views. `}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={true}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="OK"
          confirmButtonColor={BLUE}
          onCancelPressed={() => {
            this.setState({
              lockedMessage: false
            })
          }}
          onConfirmPressed={() => {
            this.setState({
              lockedMessage: false
            });
          }}
        />

      </View>
    );
  }
}
