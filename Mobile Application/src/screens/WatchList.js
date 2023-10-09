import React, { Component } from 'react';
import { View, Text, AsyncStorage, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { styles, Header, LIGHTGREY, HEIGHT, WIDTH, BLUE } from '../utils/utils';
import { fetchWatchList, BASE_URL } from '../utils/configs';
import HeadingText from '../utils/HeadingText';
import Loader from '../utils/Loader';
import BlankError from '../utils/BlankError';
import { LinearGradient } from "expo-linear-gradient"
import { heightPercentageToDP as hp, widthPercentageToDP as wp, heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import AwesomeAlert from "react-native-awesome-alerts"


export default class WatchList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watchList: [],
      loading: true,
      lockedMessage: false
    };
  }

  componentWillMount() {
    AsyncStorage.getItem("user_token").then(token => {
      fetchWatchList(token).then(data => {
        if (data.success) {
          let watchList = []
          for (var vid in data.videos) {
            watchList.push(data.videos[vid])
          }
          this.setState({
            watchList: watchList,
            loading: false
          })
        }
        else {
          Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        }
      })
    })
  }

  renderWatchList = ({ item, index }) => {
    const getMinutesFromSeconds = (time) => {
      const minutes = time >= 60 ? Math.floor(time / 60) : 0;
      const seconds = Math.floor(time - minutes * 60);
      return `${minutes >= 10 ? minutes : '0' + minutes}:${seconds >= 10 ? seconds : '0' + seconds
        }`;
    }

    return item.locked ? (
      <TouchableOpacity onPress={() => this.setState({ lockedMessage: true })} style={{ flexDirection: 'row', justifyContent: 'space-between', width: hp("50%"), marginTop: 10, borderBottomColor: "#ececec", borderBottomWidth: .5 }}>
        <View style={{ height: hp("10%"), width: hp("20%"), borderRadius: 10, margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
          <View style={{ flex: 1, height: hp("10"), width: hp("20%"), borderRadius: 10, }}>
            <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ height: hp("10"), width: hp("20%") }} />
            <LinearGradient colors={['transparent', 'transparent',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: hp("10"), width: hp("20%") }} >
              <Text numberOfLines={2} style={{ color: 'white', fontSize: hp("1"), margin: hp("1.2"), width: hp("12%"), position: 'absolute', bottom: hp(2) }}>
                {/* {item.title} */}
              </Text>
            </LinearGradient>
          </View>
          <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require("../../assets/play-button-min.png")} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
          </View>
        </View>
        <View style={{ margin: 5, padding: 10, width: wp("60%"), justifyContent: 'space-between' }}>
          <Text style={{ color: "black", fontSize: hp("1.8%"), width: WIDTH / 2, fontFamily: 'Roboto-Bold' }} numberOfLines={2}>{item.title}</Text>
          <Text style={{ color: "black", width: WIDTH / 2, fontSize: hp("1.5%"), marginTop: 10 }} numberOfLines={1}><AntDesign name="clockcircleo" size={hp("1.5%")} color={"black"} />  {getMinutesFromSeconds(item.duration)}</Text>
        </View>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("VideoPlayer", { item: item })} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomColor: "#ececec", borderBottomWidth: .5 }}>
        <View style={{ height: hp("10%"), width: hp("20%"), borderRadius: heightPercentageToDP(.7), margin: 0, overflow: 'hidden', paddingTop: 0, margin: 5, }}>
          <View style={{ flex: 1, height: hp("10"), width: hp("20%"), borderRadius: heightPercentageToDP(.7) }}>
            <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ height: hp("10"), width: hp("20%") }} />
            {/* <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)',]} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'flex-end', alignItems: 'flex-start', height: hp("10"), width: hp("20%") }} >
        </LinearGradient> */}
          </View>
          <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require("../../assets/play-button-min.png")} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
          </View>
        </View>
        <View style={{ margin: 5, padding: 10, width: wp("60%"), justifyContent: 'space-between' }}>
          <Text style={{ color: "black", fontSize: hp("1.8%"), width: WIDTH / 2, fontFamily: 'Roboto-Bold' }} numberOfLines={2}>{item.title}</Text>
          <Text style={{ color: "black", width: WIDTH / 2, fontSize: hp("1.5%"), marginTop: 10 }} numberOfLines={1}><AntDesign name="clockcircleo" size={hp("1.5%")} color={"black"} />  {getMinutesFromSeconds(item.duration)}</Text>
        </View>
      </TouchableOpacity>
    )
  }


  render() {
    return this.state.loading ? <Loader /> : (
      <View style={styles.BG_STYLE}>
        <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title="Bookmarks" />
        {/* <HeadingText text="Your WatchList" /> */}
        <View style={{ flex: 1 }}>
          {
            this.state.watchList.length == 0 ?
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                <BlankError text="No Bookmarks Videos." />
              </View>
              :
              <FlatList
                data={this.state.watchList}
                renderItem={this.renderWatchList}
                style={{ flex: 1 }}
              />
          }
        </View>
        <AwesomeAlert
          show={this.state.lockedMessage}
          showProgress={false}
          title={`Course View Limit`}
          message={`Your video view limit has been crossed. Please contact administrator for more details.`}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={true}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="OK"
          confirmButtonColor={BLUE}
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
