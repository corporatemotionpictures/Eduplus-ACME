import React, { Component } from 'react';
import { View, Text, AsyncStorage, Alert, Linking, Modal, TouchableHighlight } from 'react-native';
import LottieView from "lottie-react-native";
import Webview from "react-native-webview";
import { Header, styles, BG_COLOR, BLUE, NEW_GRAD1, NEW_GRAD2 } from '../utils/utils';
import { BASE_URL, checkPaymentStatus } from '../utils/configs';
import { LinearGradient } from "expo-linear-gradient"
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';


export default class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
    loading:true,
    userToken:'',
    webview: null,
    paymentDialog: false,
    paymentDialogFailed: false,
    };
  }

  Show_Custom_Alert = () => {
    this.setState({
      paymentDialog: true,
    });
    setTimeout(() => {
      //this.RBSheet.close()
      //this.props.navigation.navigate("OrderList")
      this.setState({
        paymentDialog: false,
      });
    }, 3000);
  };

  componentWillMount(){
    AsyncStorage.getItem("user_token")
    .then((token) =>{
     console.log(token)
      this.setState({userToken:token})
    })
  }

  ShowAlertDialogFailed = () =>{
    Alert.alert(
      'Failed', 
      'Your payment request is failed',
      [
        {text: 'OK', onPress: () => this.props.navigation.navigate("Home")},
      ]
    )
  }

  checkStatus = async (uuid) => {
    console.log("CHECKING UUID")
    console.log(uuid)
    AsyncStorage.getItem("user_token").then(token => {
      checkPaymentStatus(token, uuid).then(res => {
        if (res.success) {
          console.log(res)
          this.props.navigation.navigate("OrderList")
          //this.Show_Custom_Alert();
          //this.ShowAlertDialogSuccess();
          this.setState({
            loading: false,
            check: res.order_status
          })
          console.log(this.state.check);
        }
      })
    })
  };

  handleWebViewNavigationStateChange = newNavState => {
    const { url } = newNavState;
    console.log("NEW URL")
    console.log(url)

    if (url.includes('success')) {
      this.webview.stopLoading();
      const lastItem = url.substring(url.lastIndexOf('/') + 1)
      console.log("LAST PATH")
      console.log(lastItem)
      this.checkStatus(lastItem)
      //Alert.alert("success");
    }

    if (url.includes('failed')) {
      this.webview.stopLoading();
      this.ShowAlertDialogFailed()
    }
  };

  render() {
    const INJECTEDJAVASCRIPT = "document.body.style.userSelect = 'none'"
    return (
      <View style={{flex:1,padding:0,backgroundColor:BG_COLOR}}>
       <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title="Checkout" />
       <Modal
          visible={this.state.paymentDialog}
          transparent={true}
          animationType={"fade"}
        >
          <View style={{
            justifyContent: 'center', alignItems: 'center', margin: 140, borderRadius: 10, backgroundColor: '#FFFFFF', shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5
          }}>
            <Text style={{marginTop: 10, fontSize: heightPercentageToDP(1.4), color: 'black', textAlign: 'center', justifyContent: 'center', alignSelf: 'center', alignItems: 'center', alignContent: 'center',}}>Payment Done Successfully</Text>
            <LottieView 
              autoPlay
              source={require("../utils/paymentsuccess.json")}
              style={{height:80,width:80, textAlign:'center', justifyContent:'center', alignSelf:'center', alignItems:'center', alignContent:'center'}}
              resizeMode="contain"
            />
              <TouchableHighlight onPress={() => { this.Show_Custom_Alert(!this.state.paymentDialog) }} style={{ backgroundColor: BLUE, height: heightPercentageToDP(7), width: widthPercentageToDP(40), borderRadius: 4, bottom: 5, justifyContent: 'center', alignItems: 'center', alignContent: 'center', alignSelf: 'center' }} >
                <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} >
                  <Text style={{ color: 'white', fontSize: heightPercentageToDP(2.5), fontWeight: 'normal', justifyContent: 'center', alignItems: 'center' }} >Okay</Text>
                </LinearGradient>
              </TouchableHighlight>
          </View>
        </Modal>
       <Webview 
            //source={{uri:`${BASE_URL}/payment?token=${this.state.userToken}`}}
            ref={ref => (this.webview = ref)}
            source={{uri: `${BASE_URL}/payment?token=`+this.state.userToken}}
            javaScriptEnabled={true}
            javaScriptEnabledAndroid={true}
            injectedJavaScript={INJECTEDJAVASCRIPT}
            scalesPageToFit={true}
            cacheEnabled={true}
            incognito={true}
            onError={() => Alert.alert("No Response from server!")}
            startInLoadingState={true}
            useWebKit={true}
            originWhitelist={['*']}
            thirdPartyCookiesEnabled={true}
            onNavigationStateChange={this.handleWebViewNavigationStateChange}
       />
      </View>
    );
  }
}
