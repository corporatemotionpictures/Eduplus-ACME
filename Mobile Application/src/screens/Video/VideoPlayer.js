import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, AsyncStorage, Image, FlatList, Share, Alert, TextInput, KeyboardAvoidingView, ScrollView, ActivityIndicator, StatusBar, StyleSheet, TouchableNativeFeedback, Slider, Keyboard, BackHandler, } from 'react-native';
import { MaterialIcons, Ionicons, AntDesign, Entypo, Octicons } from "@expo/vector-icons"
import { styles, Header, HEIGHT, LIGHTGREY, BG_COLOR, WIDTH, GREEN, GREY, LIGHT_GREY, GRAD1, GRAD2, BLUE, SECONDARY_COLOR } from '../../utils/utils';
import Orientation from "react-native-orientation"
import { sendVideoLogs, addVideoComments, fetchVideoComments, BASE_URL, fetchVideo, fetchVideoLikes, addVideoLikes, removeVideoLikes, addVideoWatchList, removeWatchLists, fetchChapterSubjectWise, fetchVideos, fetchUserDetails, fetchSingleVideo, checkVideoThreshold } from '../../utils/configs';
import Background from '../../utils/Background';
import Watermark from './Watermark';
import Video from 'react-native-video'
import AwesomeAlert from 'react-native-awesome-alerts';
import KeepAwake from 'react-native-keep-awake';
import MediaControls, { PLAYER_STATES } from 'react-native-media-controls';
import moment from "moment"
import LottieView from "lottie-react-native"
import * as Animatable from "react-native-animatable"
import { Menu, List } from 'react-native-paper';
import HeadingText from '../../utils/HeadingText';
import Loader from '../../utils/Loader';
import BlankError from '../../utils/BlankError';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, removeOrientationListener, heightPercentageToDP } from 'react-native-responsive-screen';
import axios from 'axios';
import { hideNavigationBar, showNavigationBar } from 'react-native-navigation-bar-color';

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      quality: '360p',
      error: '',
      isReady: false,
      status: '',
      videoData: this.props.navigation.state.params.item,
      showModal: false,
      comments: [],
      commentText: '',
      addingcomment: false,
      modalVisible: false,
      tab: '1',
      videos: [],
      thumbnailUrl: "",
      videoUrl: "",
      video: "",
      embed: '',
      fullScreen: false,
      seekTime: 0,
      playable: 0,
      token: '',
      offset: 0,
      likes: [],
      like: false,
      watchList: false,
      likeID: undefined,
      offset: 0,
      chapters: [],
      allLikes: [],
      chapterVideos: [],
      accordianID: '',
      currentTime: 0,
      duration: 0,
      isFullScreen: false,
      isLoading: true,
      paused: false,
      playerState: PLAYER_STATES.PLAYING,
      screenType: 'content',
      mute: false,
      overlay: false,
      showQuality: false,
      play: true,
      userDetails: {},
      likeAnimation: false,
      speed: 1,
      fullScreenplay: true,
      loadingTrack: false,
      userDetails: '',
      videoThresold: 0,
      videoViews: 0,
      viewsAdded: false,
      videoHeight: heightPercentageToDP(27.5),
      SCREEN_HEIGHT: Dimensions.get("screen").height,
      SCREEN_WIDTH: Dimensions.get("screen").width,
      showRate: false,
      videoUrl: '',
      videoWidth: wp("100")
    };
  }

  onPaused = playerState => {
    //Handler for Video Pause
    this.setState({
      paused: !this.state.paused,
      playerState,
    });
  };

  onReplay = () => {
    //Handler for Replay
    this.setState({ playerState: PLAYER_STATES.PLAYING });
    this.videoPlayer.seek(0);
  };

  onProgress = progress => {
    this.setState({
      currentTime: progress.currentTime
    })
  };


  onLoad = data => {
    this.setState({ duration: data.duration, isLoading: false, });
    this.videoPlayer.seek(this.state.currentTime, 1000);

  }
  onLoadStart = data => this.setState({ isLoading: true });

  onEnd = () => this.setState({ playerState: PLAYER_STATES.ENDED });

  onError = () => alert('Oh! ', error);

  renderToolbar = () => (
    <View />
  );

  onSeeking = currentTime => this.setState({ currentTime });

  componentWillUnmount() {
    KeepAwake.deactivate()
    BackHandler.removeEventListener("hardwareBackPress", this.backAction);
  }


  componentDidMount() {

    BackHandler.addEventListener('hardwareBackPress', this.backAction)
    KeepAwake.activate();

    AsyncStorage.getItem("user_token").then(token => {
      AsyncStorage.getItem("user_id").then((res) => {

        this.setState({ user_id: res })
        fetchUserDetails(res, token).then((res) => {
          if (res.success) {
            this.setState({
              userDetails: res.user,
            })
          } else {
            Alert.alert(res.error)
          }
        })
      })

    });

    fetchVideoLikes(this.state.token, this.state.videoData.id).then(data => {
      if (data.success) {
        this.setState({
          likes: data.likes.length,
          allLikes: data.likes
        })
      }
    })

    this.state.allLikes.map((item, index) => {
      item.id = this.state.likeID ? this.setState({ like: true }) : this.setState({ like: true })
    })

    fetchVideoComments(this.state.token, this.state.videoData.id).then((data) => {
      if (data.success) {
        this.setState({
          comments: data.comments,
        })
      }
    })
  }


  backAction = () => {
    if (this.state.isFullScreen) {
      Orientation.lockToPortrait();
      this.videoPlayer.dismissFullscreenPlayer();
      this.setState(
        {
          screenType: "content",
          isFullScreen: false,
          videoWidth: wp(100),
          videoHeight: 240,
        }, () => {
          StatusBar.setHidden(false);
        })

    } else {
      Alert.alert("Hold on!", "Are you sure you want to go back?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { text: "YES", onPress: () => this.props.navigation.goBack() }
      ]);

    }
    return true;
  }

  componentWillMount() {

    AsyncStorage.getItem("user_token").then((token) => {
      this.setState({
        token: token
      })

      fetchSingleVideo(this.state.videoData.id, token, "1080p").then(data => {
        console.log(data.video.progressive)
        if (data.success) {
          this.setState({
            videoData: data.video,
            videoUrl: data.video.videoUrl,
            play: true
          })
        } else {
          Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        }
      })


      AsyncStorage.getItem("user_id").then(id => {
        fetchUserDetails(id, token).then((res) => {
          if (res.success) {
            this.setState({
              userDetails: res.user,
            })
          } else {
            Alert.alert(res.error)
          }
        })
      })

      fetchChapterSubjectWise(token, this.state.offset, this.state.videoData.subject_id).then(data => {
        if (data.success) {
          this.setState({
            chapters: data.chapters,
            loading: false
          });
        }
      })

      sendVideoLogs(token, this.state.videoData.id).then(data => {
        if (data.success) {
          this.setState({
            viewsAdded: true
          })
        }
        else {
          Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        }
      })

      fetchVideoComments(token, this.state.videoData.id).then((data) => {
        if (data.success) {
          this.setState({
            comments: data.comments,
            token: token,
          })
        }
        else {
          Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
        }
      })
    })




  }

  addComment = () => {
    if (this.state.commentText.length == 0) {
      return
    }
    this.setState({
      addingcomment: true
    })
    AsyncStorage.getItem("user_token").then(token => {
      addVideoComments(token, this.state.commentText, this.state.videoData.id).then(data => {
        if (data.success) {
          this.setState({
            commentText: '',
            addingcomment: false
          })
          Alert.alert("Comment Added")
          this.componentWillMount()
        }
      })
    })

  }


  openChannel = () => {
    this.setState({
      modalVisible: true
    })
  }





  share = async () => {
    try {
      const result = await Share.share({
        url: BASE_URL,
        message: `Please Download the ACME Academy App to prepare for GATE exams. ${BASE_URL}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  }

  renderComments = ({ item, index }) => {
    return (
      <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2, borderBottomColor: LIGHTGREY, borderBottomWidth: .4, width: WIDTH }}>
        <View style={{ flexDirection: 'row', padding: 2, }}>
          <View>
            <Image source={{ uri: item.user_image != null ? `${BASE_URL}${item.user_image}` : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png" }} style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'white', margin: 10 }} />
          </View>
          <View style={{ justifyContent: 'space-around' }}>
            <Text style={{ color: 'white', padding: 4, textAlign: 'left', fontSize: 13, fontFamily: 'Roboto-Bold', marginTop: 5 }} numberOfLines={2}>{item.user_first_name}</Text>
            <Text style={{ color: 'white', padding: 5, textAlign: 'left', fontSize: 14, }} numberOfLines={2}>{item.comment}</Text>
          </View>
        </View>
        <View style={{ marginRight: 8 }}>
          <Text style={{ color: 'white', padding: 4, textAlign: 'left', fontSize: 9, fontFamily: 'Roboto-Bold', marginTop: 5 }} numberOfLines={2}>{moment(item.created_at).fromNow()}</Text>
          <Text style={{ color: 'white', fontSize: 9, padding: 4 }}></Text>
        </View>
      </TouchableOpacity>
    )
  }

  handleTab = (val) => {
    this.setState({
      tab: val
    })
  }

  handleOrientation = (orientation) => {
    orientation === 'LANDSCAPE-LEFT' || orientation === 'LANDSCAPE-RIGHT'
      ?
      this.setState({ fullScreen: true }) && StatusBar.setHidden(true)
      :
      this.setState({ fullScreen: false }) && StatusBar.setHidden(false)
  }


  handleFullscreen = () => {
    this.setState({ fullScreen: true }) && StatusBar.setHidden(true, "slide")
    Orientation.lockToLandscape();
  }

  handleFullscreenExit = () => {
    this.setState({ fullScreen: false }) && StatusBar.setHidden(false)
    Orientation.lockToPortrait();

  }


  playTrack = async (video) => {
    if (video.id == this.state.videoData.id) {
      return;
    }
    let videos
    this.setState({
      loadingTrack: true,
      currentTime: 0,
      play: false
    })
    await axios.get(`${BASE_URL}/api/v1/videos/${video.id}`, {
      headers: {
        'X-AUTH-TOKEN': this.state.token
      }
    })
      .then((data) => {
        videos = data.data;
      });
    this.setState({
      videoData: videos.video,
      loadingTrack: false,
      viewsAdded: false,
      currentTime: 0,
      play: true,
      videoUrl: videos.video.videoUrl
    }, () => {
      this.componentDidMount()
      this.state.allLikes.map((item, index) => {
        item.id = this.state.likeID ? this.setState({ like: true }) : this.setState({ like: true })
      })
    })
  }

  skipBackward = () => {
    if (this.state.currentTime == 0) {
      return;
    } else {
      this.videoPlayer.seek(this.state.currentTime - 10, 100);
      this.setState({ currentTime: this.state.currentTime - 10 });
    }
  }

  skipForward = () => {
    this.videoPlayer.seek(this.state.currentTime + 10, 100);
    this.setState({ currentTime: this.state.currentTime + 10 });
  }

  onSeek = (data) => {
    console.log(data)
    this.setState({ currentTime: data }, () => {
      this.videoPlayer.seek(data, 100);
    });
  }

  renderVideoList = ({ item, index }) => {
    const getMinutesFromSeconds = (time) => {
      const minutes = time >= 60 ? Math.floor(time / 60) : 0;
      const seconds = Math.floor(time - minutes * 60);
      return `${minutes >= 10 ? minutes : '0' + minutes}:${seconds >= 10 ? seconds : '0' + seconds
        }`;
    }


    return (
      <TouchableOpacity onPress={() => this.playTrack(item)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: GRAD2, borderRadius: 6, margin: 5, }} >
        <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: hp("5%"), height: hp("5%"), borderRadius: 3, margin: 3 }} />
        <View style={{ flexDirection: "column" }}>
          <Text style={{ color: "white", fontSize: 12, margin: 2, width: wp("60%") }} numberOfLines={2}  >{item.title}</Text>
          {/* <Text style={{color:"white",fontSize:10,margin:2,justifyContent:'space-between'}}>{item.subject_name}</Text> */}
          <Text style={{ color: "white", fontSize: 10, margin: 2, }}><AntDesign name="clockcircleo" size={8} color={GREY} /> {getMinutesFromSeconds(item.duration)}</Text>
        </View>
        {
          item.id == this.state.videoData.id
            ?
            <Ionicons name="ios-pause" size={20} style={{ position: 'absolute', top: 15, right: 15 }} color={"gery"} />
            :
            <Ionicons name="ios-play" size={20} style={{ position: 'absolute', top: 15, right: 15 }} color={"gery"} />
        }
      </TouchableOpacity>
    )
  }


  addLikes = () => {
    addVideoLikes(this.state.token, this.state.videoData.id).then(data => {
      if (data.success) {
        this.setState({
          like: true,
          likeID: data.like.id
        })
      } else {
        Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
      }
    })
    this.componentDidMount()
  }

  removeLikes = () => {
    removeVideoLikes(this.state.token, this.state.videoData.id).then(data => {
      if (data.success) {
        this.setState({
          like: false,
          likeID: ''
        })
      } else {
        Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
      }
    })
    this.componentDidMount()
  }


  addWatchList = () => {
    addVideoWatchList(this.state.token, this.state.videoData.id).then(data => {
      console.log(data)
      if (data.success) {
        this.setState({
          watchList: true
        })
      } else {
        Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime. on adding watchlist")
      }
    })
    this.componentDidMount()
  }

  removeWatchList = () => {
    removeWatchLists(this.state.token, this.state.videoData.id).then(data => {
      if (data.success) {
        this.setState({
          watchList: false
        })
      }
      else {
        Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime. on removing Watchlist")
      }
    })
    this.componentDidMount()
  }

  handleLikes = () => {
    this.setState({
      likeAnimation: true
    })
    !this.state.like ? this.addLikes() : this.removeLikes()
    setTimeout(() => {
      this.setState({
        likeAnimation: false
      })
    }, 1500)
  }

  handleWatchList = () => {
    !this.state.watchList ? this.addWatchList() : this.removeWatchList()
  }


  openAccordian = (chapter) => {
    chapter.id == this.state.accordianID ? this.setState({
      accordianID: null
    }) : this.setState({
      accordianID: chapter.id
    })

    fetchVideo(chapter.id, this.state.token,).then((data) => {
      console.log(data)
      this.setState({
        chapterVideos: data.videos,
      })
    })
  }

  handleDisclaimer = () => {
    this.setState({
      showModal: true
    });
  }
  handleMute = () => {
    this.setState({
      mute: !this.state.mute
    })
  }

  handleOverlay = () => {
    this.setState({
      overlay: !this.state.overlay,
      showQuality: false
    })
  }

  exitFullScreen = () => {
    this.videoPlayer.dismissFullscreenPlayer()
    this.setState({ screenType: 'content', isFullScreen: false, fullScreen: false, }, () => {
      this.videoPlayer.seek(this.state.currentTime, 500)
      this.setState({ play: true })
    })
    // Orientation.unlockAllOrientations()
    Orientation.lockToPortrait()
  };



  onFullScreen = () => {
    Orientation.lockToLandscape()
    this.videoPlayer.presentFullscreenPlayer();
    this.videoPlayer.seek(this.state.currentTime, 500);
    this.setState({ screenType: 'cover', isFullScreen: true, fullScreen: true, play: false }, () => {
    });
  };

  _onLayout = event => {
    this.setState({
      SCREEN_HEIGHT: event.nativeEvent.layout.height,
      SCREEN_WIDTH: event.nativeEvent.layout.width,
      videoHeight: 240
    });
  };


  setQuality = (item) => {
    this.setState({ showQuality: false, videoUrl: item.url, quality: item.quality, fullScreenplay: false })
    setTimeout(() => {
      this.setState({ fullScreenplay: true })
    }, 3000)
  }

  render() {
    const secondsToMinutes = (timeInSeconds) => {
      var sec_num = parseInt(timeInSeconds);
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      var seconds = sec_num - (hours * 3600) - (minutes * 60);
      if (hours < 10) { hours = "0" + hours; }
      if (minutes < 10) { minutes = "0" + minutes; }
      if (seconds < 10) { seconds = "0" + seconds; }
      // console.log(hours+':'+minutes+':'+seconds);
      return hours + ':' + minutes + ':' + seconds
    }

    const renderVideoList = ({ item, index }) => {

      return (

        <TouchableOpacity onPress={() => this.playTrack(item)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: GRAD2, borderRadius: 6, margin: 5, }} >
          <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={{ width: hp("5%"), height: hp("5%"), borderRadius: 3, margin: 3 }} />
          <View style={{ flexDirection: "column" }}>
            <Text style={{ color: "white", fontSize: 12, margin: 2, width: wp("60%") }} numberOfLines={2}  >{item.title}</Text>
            {/* <Text style={{color:"white",fontSize:10,margin:2,justifyContent:'space-between'}}>{item.subject_name}</Text> */}
            <Text style={{ color: "white", fontSize: 10, margin: 2, }}><AntDesign name="clockcircleo" size={8} color={GREY} /> {getMinutesFromSeconds(item.duration)}</Text>
          </View>
          {
            item.id == this.state.videoData.id
              ?
              <Ionicons name="ios-pause" size={20} style={{ position: 'absolute', top: 15, right: 15 }} color={"gery"} />
              :
              <Ionicons name="ios-play" size={20} style={{ position: 'absolute', top: 15, right: 15 }} color={"gery"} />
          }
        </TouchableOpacity>
      )
    }


    const getMinutesFromSeconds = (time) => {
      const minutes = time >= 60 ? Math.floor(time / 60) : 0;
      const seconds = Math.floor(time - minutes * 60);
      return `${minutes >= 10 ? minutes : '0' + minutes}:${seconds >= 10 ? seconds : '0' + seconds
        }`;
    }

    const changeOrientation = () => {
      Orientation.lockToPortrait()
    }

    const getScreen = () => {
      return Dimensions.get('screen');
    }

    const exitFullScreen = () => {
      this.videoPlayer.dismissFullscreenPlayer()
      this.setState({ screenType: 'content', isFullScreen: false, fullScreen: false, }, () => {
        this.videoPlayer.seek(this.state.currentTime, 500)
        this.setState({ play: true })
      })
      // Orientation.unlockAllOrientations()
      Orientation.lockToPortrait()
    };



    const onFullScreen = () => {

      if (this.state.isFullScreen) {
        Orientation.lockToPortrait();
        this.videoPlayer.dismissFullscreenPlayer();
        this.setState(
          {
            screenType: "content",
            isFullScreen: false,
            videoWidth: wp(100),
            videoHeight: 240,
          }, () => {
            StatusBar.setHidden(false);
          })
      } else {
        Orientation.lockToLandscape()
        hideNavigationBar(true)
        this.videoPlayer.presentFullscreenPlayer();
        this.setState(
          {
            videoWidth: hp(100),
            videoHeight: wp(100),
            screenType: 'cover',
            isFullScreen: true,
          }, () => {
            StatusBar.setHidden(true);
          })
      }
    };



    return (
      <View style={[styles.BG_STYLE, { padding: 0, }]}>
        {/* <Background /> */}
        {this.state.isFullScreen ? null : <Header title={this.state.videoData.title} backIcon onbackIconPress={() => this.backAction()}
          rightIcon="ios-information-circle-outline" onPress={() => this.setState({ showModal: true })} />}
        {/* <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}> */}
        <View style={{ width: this.state.videoWidth, height: this.state.videoHeight }}>
          <TouchableOpacity onPress={this.handleOverlay} activeOpacity={1} style={{ width: this.state.videoWidth, height: this.state.videoHeight }}>
            {/* VideoPlayer */}
            {
              (this.state.videoData.videoUrl == undefined ?
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="white" /></View> :
                <View style={{ flex: 1, overflow: 'hidden', width: this.state.videoWidth, height: this.state.videoHeight }}>
                  <Video
                    onEnd={this.onEnd}
                    onLoad={this.onLoad}
                    onLoadStart={this.onLoadStart}
                    onProgress={this.onProgress}
                    ref={videoPlayer => (this.videoPlayer = videoPlayer)}
                    resizeMode={this.state.screenType}
                    onFullScreen={this.state.isFullScreen}
                    source={{ uri: this.state.videoUrl }}
                    fullscreenOrientation="landscape"
                    fullscreenAutorotate={this.state.isFullScreen}
                    fullscreen={this.state.isFullScreen}
                    paused={!this.state.play}
                    style={videoStyles.mediaPlayer}
                    currentTime={this.state.currentTime}
                    autoPlay
                    volume={10}
                    playWhenInactive
                    muted={this.state.mute}
                    controls={false}
                    rate={this.state.speed}
                    poster={`${BASE_URL}${this.state.videoData.thumbnail}`}
                  />
                  {this.state.userDetails.mobile_number == undefined
                    ?
                    null
                    :
                    <Watermark watermarkText={this.state.userDetails.mobile_number + "\n" + this.state.userDetails.first_name} />
                  }
                </View>)}
            {/* VideoPlayer */}

            {<Animatable.View duration={100} animation={this.state.overlay ? "fadeIn" : "fadeOut"} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', }}>
              {/* <AntDesign onPress={this.skipBackward} name="banckward" size={34} color={"rgba(0,0,0,.5)"} /> */}
              <TouchableOpacity onPress={this.skipBackward} ><MaterialIcons name="replay-10" size={44} color={"rgba(255,255,255,.9)"} /></TouchableOpacity>
              {
                (!this.state.play ?
                  <AntDesign onPress={() => this.setState({ play: true })} name="play" size={40} color={"rgba(255,255,255,.9)"} />
                  :
                  <MaterialIcons onPress={() => this.setState({ play: false })} name="pause-circle-filled" size={44} color="rgba(255,255,255,.9)" />
                )// <Entypo  name="controller-paus" size={34} color={""} />
              }
              <TouchableOpacity onPress={this.skipForward}>
                <MaterialIcons name="forward-10" size={44} color="rgba(255,255,255,.9)" /></TouchableOpacity>
              {/* <AntDesign  name="forward" size={34} color={GREEN} /> */}
              <TouchableOpacity onPress={() => this.setState({ showRate: !this.state.showRate })} style={{ position: 'absolute', top: 15, right: 10 }}>
                <Ionicons name="ios-settings" size={20} color="white" />
                <Text style={{ position: 'absolute', top: 10, color: "white", backgroundColor: LIGHTGREY, borderRadius: 5, fontSize: 8, width: 20, textAlign: 'center' }}>{this.state.speed}.x</Text>
              </TouchableOpacity>
              {
                this.state.showRate
                  ?
                  <View style={{ position: 'absolute', top: 20, right: 10, width: 80 }}>
                    <List.Item title={"1.0x"} style={{ backgroundColor: 'white', }} onPress={() => this.setState({ speed: 1, showRate: false })} />
                    <List.Item title={"1.25x"} style={{ backgroundColor: 'white', }} onPress={() => this.setState({ speed: 1.25, showRate: false })} />
                    <List.Item title={"1.50x"} style={{ backgroundColor: 'white', }} onPress={() => this.setState({ speed: 1.50, showRate: false })} />
                    <List.Item title={"1.75x"} style={{ backgroundColor: 'white', }} onPress={() => this.setState({ speed: 1.75, showRate: false })} />
                  </View>
                  :
                  null
              }
            </Animatable.View >}

            {this.state.videoData.videoUrl == undefined ? null : <Animatable.View duration={100} animation={this.state.overlay ? "fadeIn" : "fadeOut"} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: "center", alignItems: 'center', padding: 10, flexDirection: 'row' }}>

              <View style={{ flexDirection: 'row', justifyContent: 'space-around', margin: 5, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: 'white' }}>{!isNaN(getMinutesFromSeconds(this.state.currentTime)) ? 0 : getMinutesFromSeconds(this.state.currentTime)}</Text>
                <Slider
                  style={{ width: (this.state.videoWidth / 1.5) - 10 }}
                  focusable minimumValue={0}
                  maximumValue={this.state.duration}
                  minimumTrackTintColor={GREEN}
                  maximumTrackTintColor="#fff"
                  thumbTintColor={GREEN}
                  onSlidingComplete={this.onSeek}
                  value={this.state.currentTime}
                />
                <Text style={{ fontSize: 10, color: 'white' }}>{getMinutesFromSeconds(this.state.duration)}</Text>
              </View>
              <TouchableOpacity onPress={() => this.handleMute()} style={{ margin: 3 }}>
                {
                  this.state.mute ?
                    <Octicons name="mute" color={"white"} size={15} />
                    :
                    <Octicons name="unmute" color={"white"} size={15} />
                }
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onFullScreen()} style={{ margin: 3 }}>
                <MaterialIcons name="fullscreen" color={"white"} size={20} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => this.setState({ showQuality: !this.state.showQuality })} style={{ margin: 3 }}>
                <Ionicons name="ios-settings" color={"white"} size={20} />
              </TouchableOpacity>

            </Animatable.View>}
            {
              this.state.showQuality
                ?
                <View style={{ position: 'absolute', bottom: 20, right: 10, width: 80 }}>
                  <TouchableOpacity onPress={() => this.setState({ showQuality: false, videoUrl: this.state.videoData.videoUrl })} style={{ zIndex: 10 }} ><Text style={{ fontSize: heightPercentageToDP(1.3), padding: 5, backgroundColor: 'white', textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold' }}>{"Auto"}</Text></TouchableOpacity>

                  {
                    this.state.videoData.progressive.map((item, index) => {
                      return (
                        <TouchableNativeFeedback onPress={() => this.setState({ showQuality: false, videoUrl: item.url, quality: item.quality })} style={{ zIndex: 10 }} ><Text style={{ fontSize: heightPercentageToDP(1.3), padding: 5, backgroundColor: 'white', textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold', color: this.state.quality == item.quality ? BLUE : 'black' }}>{item.quality} <Text style={{ fontWeight: 'normal' }}>{item.fps}fps</Text></Text></TouchableNativeFeedback>
                      )
                    })
                  }
                </View>
                :
                null
            }
          </TouchableOpacity>
        </View>
        {this.state.isFullScreen ? null : <ScrollView style={{ flex: 1 }}>
          <View style={{ margin: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: "white", fontSize: 18, width: (WIDTH / 1.5) }}>{this.state.videoData.title}</Text>
              <Text style={{ color: LIGHTGREY, fontSize: 14, width: WIDTH / 1.5 }}>Subject : {this.state.videoData.subject_name == null ? this.state.videoData.subject.name : this.state.videoData.subject_name}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'space-between', width: WIDTH / 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  {!this.state.likeAnimation ?
                    // <Text style={{color:LIGHTGREY,}}>
                    <AntDesign onPress={this.handleLikes} name={"like2"} size={24} color={this.state.like ? GREEN : LIGHTGREY} style={{ marginHorizontal: 8 }} />
                    :
                    <LottieView autoPlay loop={false} style={{ width: 50, height: 50, }} source={require("../../utils/LikeAnimation.json")} />
                  }
                </View>

                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: LIGHTGREY, marginHorizontal: 15 }}>
                    <Entypo onPress={this.handleWatchList} name="add-to-list" size={24} color={this.state.watchList ? GREEN : LIGHTGREY} style={{ marginHorizontal: 8 }} />
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 10, borderRadius: 8 }}>
            <TouchableOpacity onPress={() => this.handleTab("1")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: this.state.tab == "1" ? GREEN : GRAD2, padding: 10, borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}>
              <Text style={{ color: "white" }} >Videos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.handleTab("2")} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: this.state.tab == "2" ? GREEN : GRAD2, padding: 10, borderTopRightRadius: 5, borderBottomRightRadius: 5 }}>
              <Text style={{ color: "white" }}>Discussion</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }} >
            {
              this.state.tab == "1" ?
                <View style={{ flex: 1, width: this.state.videoWidth, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {
                    this.state.chapters.length == 0 ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: hp("20%") }}><ActivityIndicator size="large" color={GRAD2} /></View> :
                      (this.state.chapters.map((chapter, index) => {

                        return (
                          <List.Accordion style={{ backgroundColor: LIGHTGREY, borderRadius: 8, marginVertical: 10, width: this.state.videoWidth - 20, height: hp("7%"), justifyContent: 'center' }} titleStyle={{ color: "white", fontSize: hp("2%") }} title={chapter.name}>
                            {
                              this.state.loadingTrack ? <ActivityIndicator size={"large"} color={LIGHTGREY} />
                                :
                                <FlatList
                                  // ListFooterComponent={this._renderFooter}   
                                  onEndReachedThreshold={.5}
                                  onEndReached={this.loadMore}
                                  data={chapter.videos.data}
                                  renderItem={this.renderVideoList}
                                />
                            }
                          </List.Accordion>)
                      })
                      )
                  }
                </View>
                :
                <View style={{ flex: 1, width: this.state.videoWidth - 10, backgroundColor: "transparent", }}>
                  <View style={{ flex: 1, }}>

                    {
                      this.state.comments.length == 0 ?
                        <View style={{ justifyContent: 'center', alignItems: 'center', height: (HEIGHT / 2) - 40 }}>
                          <Text style={{ color: 'white' }}>No Comments Found</Text>
                        </View>
                        :
                        <View style={{ flex: 1, }}>
                          <FlatList
                            renderItem={this.renderComments}
                            data={this.state.comments}
                            style={{ flex: 1 }}
                          />
                        </View>
                    }
                  </View>

                </View>
            }
          </View>
        </ScrollView>
        }
        {this.state.isFullScreen ? null : (this.state.tab == "1" ? null : (<View style={{ position: 'absolute', bottom: 0, flexDirection: 'row', height: 60, backgroundColor: GRAD1, left: 0, right: 0, borderTopColor: LIGHTGREY, borderTopWidth: .5, padding: 5, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <TextInput
            style={{ backgroundColor: "#283242", color: 'white', fontSize: 10, height: 40, borderRadius: 5, flex: 1 }}
            onChangeText={(text) => this.setState({ commentText: text })}
            placeholder={' Write your Comment here'}
            placeholderTextColor={'#c7c7c7'}
            underlineColorAndroid={'transparent'}
          />
          {
            <TouchableOpacity onPress={this.addComment} style={{ justifyContent: 'center', alignItems: 'center', margin: 10 }}>
              {
                this.state.addingcomment ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="md-send" size={35} color={GREY} />
              }
            </TouchableOpacity>
          }
        </View>))}

        {/* </KeyboardAvoidingView> */}
        <Modal onDismiss={() => this.setState({ showModal: false })} onRequestClose={() => this.setState({ showModal: false })} visible={this.state.showModal} presentationStyle="fullScreen" animated animationType="fade" transparent  >
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, padding: 20, }}>
            <ScrollView style={{ borderRadius: 10, backgroundColor: 'white', }}>
              <HeadingText text="Copyright Notice" />
              <Text style={{ color: LIGHTGREY, fontSize: 12, padding: 10, textAlign: 'left', lineHeight: 20 }}>
                Company respects the intellectual property of others and asks that users of our Site do the same. In connection with our Site, we have adopted and implemented a policy respecting copyright law that provides for the removal of any infringing materials and for the termination of users of our online Site who are repeated infringers of intellectual property rights, including copyrights. If you believe that one of our users is, through the use of our Site, unlawfully infringing the copyright(s) in a work, and wish to have the allegedly infringing material removed, the following information in the form of a written notification (pursuant to 17 U.S.C. § 512(c)) must be provided to our designated Copyright Agent:
                {"\n"}1. your physical or electronic signature;
                {"\n"}2. identification of the copyrighted work(s) that you claim to have been infringed;
                {"\n"}3. identification of the material on our services that you claim is infringing and that you request us to remove;
                {"\n"}4. sufficient information to permit us to locate such material;
                {"\n"}5. your address, telephone number, and e-mail address;
                {"\n"}6. a statement that you have a good faith belief that use of the objectionable material is not authorized by the copyright owner, its agent, or under the law; and
                {"\n"}7. a statement that the information in the notification is accurate, and under penalty of perjury, that you are either the owner of the copyright that has allegedly been infringed or that you are authorized to act on behalf of the copyright owner.
                Please note that, pursuant to 17 U.S.C. § 512(f), any misrepresentation of material fact in a written notification automatically subjects the complaining party to liability for any damages, costs and attorney’s fees incurred by us in connection with the written notification and allegation of copyright infringement.
              </Text>
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => this.setState({ showModal: false })} style={{ width: WIDTH - 60, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: BLUE, borderRadius: 8 }}>
                  <Text style={{ color: "white" }}>I agree</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </Modal>


      </View>
    );
  }
}

const videoStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    marginTop: 30,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  mediaPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'black',
  },
});