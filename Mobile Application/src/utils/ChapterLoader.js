import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles, WIDTH, HEIGHT, Header, GRAD1, LIGHTGREY,  } from './utils';
import ContentLoader, { Rect, Circle,Facebook, Instagram } from 'react-content-loader/native'
import HeadingText from './HeadingText';


const FOREGROUND_COLOR = "#3f5269"

export default class SubjetcLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  render() {
    return (
      <View style={styles.BG_STYLE}>
        <ScrollView scrollEnabled={false}>
            <View>
            </View>    
        </ScrollView>
    </View>
    );
  }
}
