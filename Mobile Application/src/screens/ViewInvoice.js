import React, { Component } from 'react';
import { View, Text, AsyncStorage } from 'react-native';
import PDFReader from 'rn-pdf-reader-js'
import { styles, Header } from '../utils/utils';
import { BASE_URL } from '../utils/configs';
import Webview from "react-native-webview";

  
export default class ViewInvoice extends Component {

  constructor(props) {
    super(props);
    this.state = {
        subjectID:this.props.navigation.state.params.item.order_id,
        orderID:this.props.navigation.state.params.item.order_number,
        //title:this.props.navigation.state.params.item.order_id,
        //url:this.props.navigation.state.params.item.url
    };
  }
  componentWillMount(){
    AsyncStorage.getItem("user_token")
    .then((token) =>{
     console.log(token)
     console.log(this.state.subjectID)
     console.log(this.state.orderID)
      this.setState({userToken:token})
    })
  }

  render() {
    const INJECTEDJAVASCRIPT = "document.body.style.userSelect = 'none'"
    return (
      <View style={[styles.BG_STYLE]}>
        <Header title={"ODR# "+ this.state.subjectID} backIcon={true} onbackIconPress={() => this.props.navigation.goBack()}  />
       <Webview 
            style={{flex: 1}}
            //source={{uri:`${BASE_URL}/payment?token=${this.state.userToken}`}}
            ref={ref => (this.webview = ref)}
            source={{uri:`${BASE_URL}/invoice/ODR`+this.state.subjectID+`?token=`+this.state.userToken}}
            javaScriptEnabled={true}
            javaScriptEnabledAndroid={true}
            injectedJavaScript={INJECTEDJAVASCRIPT}
            scalesPageToFit={true}
            cacheEnabled={false}
            incognito={true}
            onError={() => Alert.alert("No Response from server!")}
            startInLoadingState={true}
            useWebKit={true}
            originWhitelist={['*']}
            thirdPartyCookiesEnabled={true}
       />
          {/* <PDFReader
                    onError={(err) =>console.log(err)}
                    source={{
                      uri: "https://v2.i-Gateacademy.com/invoice/ODR110?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoyMDIsInV1aWQiOm51bGwsImRldmljZV9pZCI6bnVsbCwiaW1hZ2UiOiIvaW1hZ2VzL2RlZmF1bHQtcHJvZmlsZS5qcGciLCJhdXRoX3Byb3ZpZGVyIjpudWxsLCJvYXV0aF9pZCI6bnVsbCwiZmlyc3RfbmFtZSI6InN3YXJuYSIsImxhc3RfbmFtZSI6InNhaHUiLCJtb2JpbGVfbnVtYmVyIjoiOTM0MDUyMDc0MSIsImVtYWlsIjoic3dhcm5hOTdzYWh1QGdtYWlsLmNvbSIsInR5cGUiOiJVU0VSIiwiZG9iIjoiMjAyMS0wMy0wNSIsImNvbGxlZ2UiOm51bGwsInllYXIiOm51bGwsImFkZHJlc3MiOm51bGwsImNpdHkiOm51bGwsInN0YXRlIjpudWxsLCJ6aXBfY29kZSI6bnVsbCwiZGV2aWNlX3R5cGUiOm51bGwsInJlZ2lzdHJhdGlvbl9udW1iZXIiOiIxMjM0NTYiLCJicmFuY2giOiI0MiIsInBhY2thZ2VfaWQiOm51bGwsInBhc3NpbmdfeWVhciI6bnVsbCwic21zX3Zlcl9jb2RlIjoiNzY3NCIsImVtYWlsX3Zlcl9jb2RlIjpudWxsLCJpc19tb2JpbGVfdmVyaWZpZWQiOjAsImlzX2VtYWlsX3ZlcmlmaWVkIjowLCJpc19hY3RpdmUiOjEsImlzX3N1c3BlbmRlZCI6MCwidmlkZW9fdmlld19saW1pdCI6MCwidmlkZW9fY291bnQiOjAsImdlbmRlciI6bnVsbCwiY2F0ZWdvcnkiOm51bGwsImNyZWF0ZWRfYXQiOiIyMDIxLTAyLTI4VDIwOjEwOjIyLjAwMFoiLCJyZW1vdmVkX2F0IjpudWxsLCJwYWNrYWdlIjoiIiwiYWRkcmVzc2VzIjpbeyJpZCI6MjksInVzZXJfaWQiOjIwMiwiYWRkcmVzcyI6ImR1cmdhIG5hZ2FyIHdlc3Qga29oa2EiLCJjaXR5IjoiYmhpbGFpIiwic3RhdGUiOiJDaGhhdHRpc2dhcmgiLCJ6aXBfY29kZSI6IjQ5MDAyMyIsImNvdW50cnkiOiJJbmRpYSIsInN0YXRlX2NvZGUiOm51bGwsImNyZWF0ZWRfYXQiOiIyMDIxLTAzLTA2VDEyOjEzOjA4LjAwMFoifV0sImFjYWRlbWljX2RldGFpbHMiOlt7ImlkIjoxNywidXNlcl9pZCI6MjAyLCJkZWdyZWUiOiJCRSIsImluc3RpdHV0ZSI6IkdlYyBqZHAiLCJwYXNzaW5nX3llYXIiOiIyMDIxLTAyIiwibWFya3MiOiIyNSUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wMy0wNlQxMjoxMzowNy4wMDBaIn1dLCJ1c2VyX2d1YXJkaWFucyI6W119LCJleHBpcnlBdCI6MTYxNTM2NDM0MTAwNiwiaWF0IjoxNjE1MzU1NzAxfQ._Azs1dHaAN2PCz4b9Wo0hXv4GqxxcwuwgJJU-ZrJWMA",
                    }}
                    customStyle={{position:'absolute',top:50}}
                    withScroll
                    //onLoad={() => console.log(this.state.url)}
                  /> */}
      </View>
    );
  }
}
