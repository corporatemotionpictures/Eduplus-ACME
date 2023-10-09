import React, { Component } from 'react';
import { View, Text } from 'react-native';
import LottieView from "lottie-react-native";
import Webview from "react-native-webview";
import { Header, styles, BG_COLOR } from '../utils/utils';
import { BASE_URL } from '../utils/configs';

export default class DeveloperContacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <View style={{ flex: 1, padding: 0, backgroundColor: BG_COLOR }}>
        <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title="ACME Academy" />
        <Webview
          source={{ uri: `${BASE_URL}` }}
          style={{ flex: 1 }}
        />
      </View>
    );
  }
}
