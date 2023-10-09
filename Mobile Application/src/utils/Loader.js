import React, { Component } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { BG_COLOR, HEIGHT, WIDTH, GRAD1, GRAD2, BLUE, LIGHTGREY } from './utils';
import LottieView from "lottie-react-native"

export default class Loader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quotes: [
        "Ever since the program began in 1981 as of 2009, there have been 113 space shuttle flights. In 2020, SpaceX successfully the world’s private company mission to space.",
        "Einstein received the Nobel Prize for Physics in 1921 for his explanation of the photoelectric effect.",
        "No one has received more U.S. patents than Thomas Edison. He got 1,093 patents to be exact.",
        "The word “hundred” comes from the old Norse term, “hundrath”, which actually means 120 and not 100.",
        "Most mathematical symbols weren’t invented until the 16th century. Before that, equations were written in words.",
        "“Forty” is the only number that is spelt with letters arranged in alphabetical order.",
        "From 0 to 1000, the only number that has the letter “a” in it is “one thousand”.",
        "Also, there are 13 letters in both “eleven plus two” and “twelve plus one”.",
        "Zero is not represented in Roman numerals.”",
      ]
    }
  }
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: HEIGHT, width: WIDTH, backgroundColor: "white" }}>
        <LottieView
          autoPlay
          loop
          source={require("../utils/loading.json")}
          style={{ height: 200, width: 200 }}
        />
        <Text style={{ fontSize: 20, color: BLUE, textAlign: 'center', width: WIDTH - 100 }}>DID YOU KNOW ?</Text>
        <Text style={{ fontSize: 15, color: "black", textAlign: 'center', width: WIDTH - 100, margin: 8 }}>
          {this.state.quotes[Math.floor(Math.random() * this.state.quotes.length)]}
        </Text>
      </View>
    );
  }
}
