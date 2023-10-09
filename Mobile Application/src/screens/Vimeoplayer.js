import React, { Component } from 'react';
import { View, Text, Modal, Dimensions, TouchableOpacity } from 'react-native';

import Video from 'react-native-af-video-player'

import { MaterialIcons } from "@expo/vector-icons/"
import { WIDTH, BG_COLOR, GREEN } from '../utils/utils';
import Orientation from 'react-native-orientation';

export default class Vimeoplayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      play: false,
      fullScreen: false,
      position: "",
      volume: 10,
      url: this.props.videoURL
    };
  }


  fullScreen = async () => {
    Orientation.lockToLandscape()
    this.setState({
      fullScreen: true
    })
  }

  exitFullScreen = async () => {
    Orientation.lockToPortrait()
    this.setState({
      fullScreen: false
    })
  }

  render() {
    console.log(this)
    return !this.state.fullScreen ? (
      <View style={{ flex: 1 }}>
        <Video
          fullscreenOrientation
          volume={this.state.volume}
          controls
          ref={ref => this.videoRef = ref}
          fullscreen={this.state.fullScreen}
          controls
          resizeMode="cover"
          style={{
            height: 300,
            width: WIDTH
          }}
          source={{ uri: this.props.videoURL }}
        />
        <View style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, }}>
          <TouchableOpacity onPress={this.fullScreen} style={{ position: 'absolute', top: 10, right: 5, width: 40, height: 40 }}>
            <MaterialIcons name="fullscreen" size={34} color="white" />
          </TouchableOpacity>
        </View>

      </View>
    ) :
      <Modal navigate={this.props.navigation} visible={this.state.fullScreen} onDismiss={() => this.setState({ fullScreen: false })} onRequestClose={() => this.setState({ fullScreen: false })}   >
        <Video
          controls
          ref={ref => this.ref = ref}
          fullscreen={this.state.fullScreen}
          controls
          resizeMode="cover"
          style={{
            height: Dimensions.get("screen").height,
            width: Dimensions.get("screen").width
          }}
          source={{ uri: this.props.videoURL }}
        />
      </Modal>;
  }
}