import React, { Component } from 'react';
import { View, Text, AsyncStorage, Image, BackHandler, ToastAndroid, Alert, ProgressBarAndroid } from 'react-native';
import { styles, GREEN, BG_COLOR, BLUE, BLUE_UP } from '../utils/utils';
import WebView from "react-native-webview"
import Loader from '../utils/Loader';
import {fetchHomePageProduct} from '../utils/configs';
import { ActivityIndicator } from 'react-native-paper';
import OTSLoader from '../utils/OTSLoader';
import BlankError from '../utils/BlankError';

export default class OTS extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userToken: null,
      otsToken:'',
      userEmail:'',
      loading: false,
      progress: 0,
    };
  }

  componentWillMount() {
    // setTimeout(() => {
    //   this.setState({
    //     loading: false
    //   })
    // }, 4000)
    AsyncStorage.getItem("user_token").then(token => {
      this.setState({
        token: token
      })

      fetchHomePageProduct(token)
        .then(res => {
          if (res.success) {
            this.setState({
              otstokenurl: res.OtsAccessUrl,
              loading: true,
            },()=> {console.log(this.state.otstokenurl)})
            console.log("OTS URL FROM API IN OTS PAGE")
            console.log(this.state.otstokenurl)
          }
        })
    })
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton = () => {
    Alert.alert("Hold on!", "Are you sure you want to go back?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel"
      },
      { text: "YES", onPress: () => this.props.navigation.goBack() }
    ]);
    return true;
  }



  render() {
    return !this.state.loading ? <OTSLoader /> : (
      <View style={{flex:1}}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', borderBottomColor: "#1a2129", borderBottomWidth: 0, paddingBottom: 10,backgroundColor:BG_COLOR }}>
          <View style={{ height: 38, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingLeft: 5 }}>
            <Image source={require("../../assets/icon.png")} style={{ width: 60, marginTop:10, resizeMode: 'contain', height: 30, paddingLeft: 10 }} />
            <Text numberOfLines={1} style={{ fontSize: 18, marginTop:10, fontFamily:'Roboto-Regular', width: 300, color: 'white', paddingLeft: 0 }}>Online Test Series</Text>
          </View>
        </View>
        {this.state.otstokenurl == null || this.state.otstokenurl == undefined ? 
        <BlankError text="Not Available" />
        :
          <WebView
            onError={() => Alert.alert("Something went wrong!")}
            startInLoadingState={true}
            //style={{ flex: 1, opacity: this.state.loading ? 0 : 1 }}
            //source={{ uri: `https://testseries.brainerygroup.com/api/ots/magicLogin?email=${this.state.userEmail}&token=${this.state.otsToken}` }}
            source={{ uri: this.state.otstokenurl}}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        }
        {/* {
          this.state.loading ?
            (<View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}><OTSLoader /></View>)
            : null
        } */}
      </View>
    );
  }
}
