import React, { Component } from 'react';
import { View, Text, StyleSheet, AsyncStorage, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { styles, Header, LIGHTGREY, BLUE, BG_COLOR } from '../utils/utils';
import { BASE_URL, fetchLiveClassWebinar } from '../utils/configs';
import Loader from '../utils/Loader';
import BlankError from '../utils/BlankError';
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import ZoomUs from 'react-native-zoom-us';
import moment from 'moment';
import { ScrollView } from 'react-native';


export default class Webinar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      watchList: [],
      liveclass: [],
      liveclass: {},
      loading: true,
      loadingMore: false,
      offset: 0,
      lockedMessage: false,
      userToken: '',
    };
  }

  componentWillMount() {
    this.zoomAuth();
    AsyncStorage.getItem("user_token").then(token => {
      this.setState({ userToken: token })
      fetchLiveClassWebinar(token, this.state.offset).then(video => {
        if (video.success) {
          this.setState({
            liveclass: video.events,
            loading: false
          })
          // console.log("LIVE LECTURES")
          // console.log(this.state.liveclass)
        }
      })
    })
  }

  zoomAuth = async () => {
    await fetch(`${BASE_URL}/api/v1/settings/zoomAuth`, {
      method: "GET",
      headers: {
        'X-AUTH-TOKEN': await AsyncStorage.getItem('user_token')
      }
    })
      .then(response => response.json())
      .then((response) => {
        this.setState({
          zoomappkey: response.value.sdkApiKey,
          zoomappsecret: response.value.sdkApiSecret
        })

      })
      .catch(err => {
        console.error(err);
        Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
      });
    this.zoominit();
  }

  zoominit = async () => {
    console.log("ZOOM INITIALIZATION")
    console.log(this.state.zoomappkey)
    console.log(this.state.zoomappsecret)
    const res = await ZoomUs.initialize({
      clientKey: this.state.zoomappkey,
      clientSecret: this.state.zoomappsecret,
    })
    console.log(res)
  }

  joinmeeting = async (zoomid, zoompassword) => {
    // initialize with extra config
    // Join Meeting
    console.log(zoomid, zoompassword)
    const res2 = await ZoomUs.joinMeeting({
      userName: await AsyncStorage.getItem('user_name'),
      meetingNumber: zoomid,
      password: zoompassword,
    })
    console.log(res2)
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
    fetchLiveClassWebinar(this.state.token, this.state.offset).then(video => {
      if (video.events.length != 0) {
        this.setState({
          liveclass: [...this.state.liveclass, ...video.events],
          loadingMore: false
        })
        console.log("LIVE LECTURES FETCH MORE")
        console.log(this.state.liveclass)
      } else {
        this.setState({
          loadingMore: false
        })
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

  renderLiveClass = ({ item, index }) => {
    var a = new Date(item.created_at);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = (a.getHours() + 24) % 12 || 12;
    var ampm = hour >= 12 ? 'PM' : 'AM';
    var min = a.getMinutes();
    var time = date + ' ' + month + ' ' + year + ' ' + '/' + ' ' + hour + '' + ':' + min + ' ' + ampm;
    var meetingtime = hour + ' ' + ':' + min + ' ' + ampm;
    console.log("ZOOM MEETING TIME")
    console.log(meetingtime)
    return (
      <View style={styles1.container1}>
        <View style={styles1.row}>
          <Image style={{ width: widthPercentageToDP(30), height: 100, borderRadius: 4 }} source={{ uri: `${BASE_URL}${item.thumbnail}` }} />
          {item.event_status == "STARTED" ?
            <View style={styles1.streaming}>
              <Text style={styles1.streamingText}>Streaming Now</Text>
            </View>
            : null}
          <View style={styles1.inner}>
            <Text style={styles1.time}>
              {moment(item.schedule_at).format('DD MMM YYYY, h:mm a')}
            </Text>
            <Text numberOfLines={2} style={styles1.title}  >
              {item.title}
            </Text>
            <Text numberOfLines={2} style={styles1.caption} >
              {item.description}
            </Text>

            <View style={{ position: 'absolute', bottom: 0 }}>
              {item.event_status == "STARTED" ?
                <View style={{
                  opacity: item.event_status == "STARTED" ? 1 : .5, backgroundColor: "#4BB543",
                  width: widthPercentageToDP(60),
                  borderRadius: 4,
                  padding: heightPercentageToDP(1),
                }}>
                  {item.base_type == "ZOOM" ?
                    <TouchableOpacity onPress={() => this.joinmeeting(item.zoom_id, item.zoomDetails.password)}>
                      <Text style={styles1.join}>JOIN NOW</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => this.props.navigation.navigate("YoutubeLive", { item: item.youtube_link, itemtitle: item.title, itemdesc: item.description })}>
                      <Text style={styles1.join}>JOIN NOW</Text>
                    </TouchableOpacity>
                  }
                </View>
                : null}
              {item.event_status == "NOT_STARTED" ?
                <View style={{
                  opacity: item.event_status == "STARTED" ? 1 : .5, backgroundColor: "#4BB543",
                  width: widthPercentageToDP(60),
                  borderRadius: 4,
                  padding: heightPercentageToDP(1),
                }}>
                  {/* {item.base_type == "ZOOM" ?
                  <TouchableOpacity onPress={() => this.joinmeeting(item.zoom_id, item.zoomDetails.password)}>
                    <Text style={styles1.join}>JOIN NOW</Text>
                  </TouchableOpacity>
                  :
                  <TouchableOpacity onPress={() => this.props.navigation.navigate("YoutubeLive", { item: item.youtube_link })}>
                    <Text style={styles1.join}>JOIN NOW</Text>
                  </TouchableOpacity>
                  } */}
                  <TouchableOpacity>
                    <Text style={styles1.join}>
                      NOT STARTED
                    </Text>
                  </TouchableOpacity>
                </View>
                : null}
              {/* {item.event_status == "NOT_STARTED"  ?
              <View style={{ opacity: item.event_status == "STARTED" ? 1 : .5, backgroundColor: BLUE,
              width: widthPercentageToDP(60),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 4,
              padding: heightPercentageToDP(1),
              marginTop: 5 }}>
            <TouchableOpacity>
                <Text style={styles.join}>
                  NOT STARTED
                </Text>
            </TouchableOpacity>
            </View>
              :null} */}
              {item.event_status == "ENDED" ?
                <View style={{
                  backgroundColor: 'red',
                  width: widthPercentageToDP(60),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 4,
                  padding: heightPercentageToDP(1),
                }}>
                  <TouchableOpacity>
                    <Text style={styles1.join}>
                      CLASS ENDED
                    </Text>
                  </TouchableOpacity>
                </View>
                : null}
            </View>
          </View>
        </View>
      </View>
    )

  }

  onRefresh = () => {
    AsyncStorage.getItem("user_token").then(token => {
      this.setState({ userToken: token })
      fetchLiveClassWebinar(token, 0).then(video => {
        if (video.success) {
          this.setState({
            liveclass: video.events,
            loading: false,
            loadingMore: false
          })
          console.log("LIVE LECTURES ON REFRESH")
          console.log(this.state.liveclass)
        }
      })
    })
  }


  render() {
    return this.state.loading ? <Loader /> : (
      <View style={styles.BG_STYLE}>
        <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title="Webinar" />
        {/* <HeadingText text="Your WatchList" /> */}
        <ScrollView refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />}>
          <View style={{ flex: 1 }}>
            {
              this.state.liveclass.length == 0 ?
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                  <BlankError text="No Webinar and"
                    text2="Demo classes available" />
                </View>
                :
                <FlatList
                  onEndReachedThreshold={.5}
                  data={this.state.liveclass}
                  ListFooterComponent={this._renderFooter}
                  onEndReached={this.loadMore}
                  renderItem={this.renderLiveClass}
                />
            }
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles1 = StyleSheet.create({
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
  },
  name: {
    fontSize: 18,
    color: "#696969",
    fontFamily: 'Roboto-Bold',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20
  },
  descriptiontxv: {
    fontSize: 15,
    color: LIGHTGREY,
    fontFamily: 'Roboto-Bold',
    marginLeft: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    marginTop: 20
  },
  price: {
    marginTop: 10,
    fontSize: 18,
    color: "green",
    fontFamily: 'Roboto-Bold',
    alignSelf: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: 10,
    color: "#696969",
    justifyContent: 'center',
    margin: 5
  },
  pickerWrapper: {
    borderColor: LIGHTGREY,
    borderWidth: .2,
    backgroundColor: "white",
    borderRadius: 4,
    margin: 10
  },
  pickerIcon: {
    color: BG_COLOR,
    position: "absolute",
    bottom: 15,
    right: 13,
    fontSize: 20,
    backgroundColor: "white",
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  pickerContent: {
    color: "lightgrey",
    backgroundColor: "transparent",
  },
  childView: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10
  },
  StarImage: {
    width: 40,
    height: 40,
    resizeMode: 'cover'
  },
  textStyle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    marginTop: 15
  },
  textStyleBig: {
    textAlign: 'center',
    fontSize: 20,
    color: '#000',
    marginTop: 15
  },
  container1: {
    borderRadius: 6,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ececec',
    padding: 5,
  },
  row: {
    flex: 1,
    flexDirection: 'row'
  },
  title: {
    fontSize: 14,
    width: widthPercentageToDP(55),
    color: '#000',
    marginRight: 10,
    fontWeight: 'bold'
  },
  inner: {
    marginLeft: 5
  },
  caption: {
    fontSize: 10,
    color: 'grey',
    width: 200,
  },
  button: {
    backgroundColor: BLUE,
    width: widthPercentageToDP(60),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    padding: heightPercentageToDP(1),
    marginTop: 5
  },
  join: {
    color: "#fff",
    textAlign: "center",
    fontSize: heightPercentageToDP(2)
  },
  time: {
    color: 'grey',
    fontSize: 10
  },
  streaming: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, .9)',
    borderRadius: 4,
    width: widthPercentageToDP(30),
    alignSelf: 'center',
    padding: 6
  },
  streamingText: {
    color: "#fff",
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: 'bold'
  }

});