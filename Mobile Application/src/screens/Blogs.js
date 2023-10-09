import React, { Component } from 'react';
import { View, Text, AsyncStorage, FlatList, TouchableOpacity, Image, Modal, ScrollView, Share, ActivityIndicator, StyleSheet, } from 'react-native';
import { styles, Header, WIDTH, LIGHT_GREY, BG_COLOR, GREEN, BLUE_UP } from '../utils/utils';
import { fetchBlog, BASE_URL } from '../utils/configs';
import Thumbnail from '../utils/Thumbnail';
import Loader from '../utils/Loader';
import HeadingText from '../utils/HeadingText';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { LinearGradient } from "expo-linear-gradient"
import moment from "moment"
import { Ionicons, FontAwesome } from "@expo/vector-icons"
import WebView from 'react-native-webview';
import BlankError from '../utils/BlankError';

export default class Blogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blogs: [],
      blog: {},
      visible: false,
      loading: true,
      loadingMore:false,
      offset:0,
      userToken: ''
    };
  }


  componentWillMount() {
    AsyncStorage.getItem("user_token")
      .then((token) => {
        console.log(token)
        this.setState({ userToken: token })
        fetchBlog(token, this.state.offset).then((res) => {
          this.setState({
            blogs: res.blogs,
            loading: false
          });
          console.log(res)
        })
      })
  }


  ActivityIndicatorElement = () => {
    return (
      <ActivityIndicator
        color={BLUE_UP}
        size="large"
        style={styles1.activityIndicatorStyle}
      />
    );
  };

  onShare = async (blog) => {
    this.setState({
      blog: blog,
    })

    try {
      const result = await Share.share({
        url: `${BASE_URL}`,
        message: `${this.state.blog.blog_url}`,
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
  };

  handleClick = (blog) => {
    this.setState({
      blog: blog,
      visible: true,
    })
  }

  loadMore = () => {
    this.setState({
          offset: this.state.offset + 10,
          loadingMore: true
        },() => {
          this.fetchMore()
        })
   }

  fetchMore = () => { 
    const offset = this.state.offset
    console.log(offset)
    fetchBlog(this.state.userToken, this.state.offset).then((res) => {
      if(res.blogs.length !=0){
      this.setState({
        blogs: [...this.state.blogs,...res.blogs],
        loadingMore:false
      });
      console.log(res)
    }else{
      this.setState({
        loadingMore:false
      })
    }
  });
}

_renderFooter =  () =>{
  return (
      <View style={{justifyContent:'center',alignItems:'center',height:heightPercentageToDP(8)}}>
              { this.state.loadingMore ?  <ActivityIndicator size="large" /> : null }
      </View>
  )
}


  renderBlogs = ({ item, index }) => {
    //console.log(item.subjects[0].name)
    var a = new Date(item.created_at);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = month + ' ' + date + ' ' + year;
    return (
      <TouchableOpacity onPress={() => this.handleClick(item)} style={{ flex: 1, width: WIDTH - 20, alignItems: 'flex-start', marginBottom: 20, overflow: 'hidden', borderColor: "#dff3f7", borderRadius: 3, borderWidth: .8 }} onPress={() => this.handleClick(item)} >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={{ uri: `${BASE_URL}${item.image}` }} style={{ width: 150, height: 140, resizeMode: 'cover', marginRight: 5 }} />
          <View style={{ flexDirection: "column" }}>
            <View style={{ flexDirection: 'row' }}>
              <FontAwesome name="calendar" size={10} color="grey" style={{ marginTop: 12, marginLeft: 10 }} />
              <Text style={{ color: 'grey', fontSize: 10, marginLeft: 5, marginTop: 10 }}>{time}</Text>
            </View>
            <Text style={{ color: 'black', fontSize: 14, fontWeight: 'bold', textAlign: 'auto', marginLeft: 10, width: 155, marginTop: 15, fontFamily: 'Lato-bold', }} numberOfLines={3}>{item.title}</Text>
            <View style={{ flexDirection: 'row', marginBottom: 10, marginTop: 10, justifyContent: 'space-around' }}>
            {item.subjects.length == 0 ? null :
              <Text style={{ color: 'white', backgroundColor: GREEN, borderRadius: 2, padding: 3, textAlign: 'center', marginLeft: 10, fontSize: 8 }} numberOfLines={1}> {item.subjects[0].name.substring(0, 18)}... </Text>}
              <TouchableOpacity onPress={() => this.onShare(item)}>
                <View style={{ flexDirection: 'row' }}>
                  <Ionicons name="ios-share-alt" size={16} color="grey" style={{ marginLeft: 20 }} />
                  <Text style={{ color: 'grey', alignItems: 'center', marginLeft: 5, fontSize: 10 }}>Share</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (this.state.loading ? <Loader /> :
      <View style={styles.BG_STYLE}>
        <Header title="Blogs" backIcon={true} onbackIconPress={() => this.props.navigation.goBack()} />

        {this.state.blogs.length !== 0 ?
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 8 }}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={this.state.blogs.reverse()}
              ListFooterComponent={this._renderFooter}  
              renderItem={this.renderBlogs}
              onEndReachedThreshold={.5}
              onEndReached={this.loadMore}
              style={{flex:1}}
            />
          </View>
          : <BlankError text="Blogs not available" />}
        <Modal
          animated
          animationType="slide"
          visible={this.state.visible}
          onDismiss={() => this.setState({ visible: false })}
          onRequestClose={() => this.setState({ visible: false })}
          presentationStyle="fullScreen">
          <View style={styles.BG_STYLE}>
            <Header title={this.state.blog.title} backIcon={true} onbackIconPress={() => this.setState({ visible: false })} />

            <WebView
              renderToHardwareTextureAndroid
              // onLoadProgress={() => this.setState({blog_loading:true})}
              source={{ uri: `${this.state.blog.blog_url}?isAndroid=true&&user_token=${this.state.userToken}` }}
              //source={{ uri: `${this.state.blog.blog_url}`}}
              style={{ flex: 1 }}
              renderLoading={this.ActivityIndicatorElement}
              //Want to show the view or not
              startInLoadingState={true}
              androidHardwareAccelerationDisabled={true}
            />
          </View>
        </Modal>
      </View>
    );
  }
}

const styles1 = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    flex: 1,
  },
  activityIndicatorStyle: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 150
  },
});