import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles, WIDTH, HEIGHT, Header, GRAD1,   } from './utils';
import ContentLoader, { Rect, Circle,Facebook, Instagram } from 'react-content-loader/native'
import HeadingText from './HeadingText';


const FOREGROUND_COLOR = "lightgrey"

export default class SubjetcLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  render() {
    return (
      <View style={{padding:8}}>
    <ScrollView scrollEnabled={false}>
        <View style={{flex:1}}>
    <View style={{marginVertical:10}}>

        <ScrollView horizontal   style={{marginTop:10,height:200,}} showsHorizontalScrollIndicator={false}>
        
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
      
        </ScrollView>
            <ScrollView horizontal   style={{marginTop:10,height:200,}} showsHorizontalScrollIndicator={false}>
        
            <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
      
                </ScrollView>
        <ScrollView horizontal   style={{marginTop:10,height:200,}} showsHorizontalScrollIndicator={false}>
        
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
      
        </ScrollView>
        <ScrollView horizontal   style={{marginTop:10,height:200,}} showsHorizontalScrollIndicator={false}>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
      
        </ScrollView>
        <ScrollView horizontal   style={{marginTop:10,height:200,}} showsHorizontalScrollIndicator={false}>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
        <View style={{margin:5,borderRadius:8,width:(WIDTH/3)-10,height:(WIDTH/3)+15,overflow:'hidden'}}>
            <ContentLoader backgroundColor={"#ececec"} foregroundColor={FOREGROUND_COLOR}  style={{width:(WIDTH/3)-10,height:(WIDTH/3)+15}} >
                <Rect width={(WIDTH/3)-10} height={(WIDTH/3)+15} />
            </ContentLoader>
        </View>
      
                </ScrollView>
                </View>
            </View>
    </ScrollView>
</View>
    );
  }
}
