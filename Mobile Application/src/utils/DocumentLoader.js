import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles, WIDTH, HEIGHT, Header, GRAD1,   } from './utils';
import ContentLoader, { Rect, Circle,Facebook, Instagram } from 'react-content-loader/native'
import HeadingText from './HeadingText';


const FOREGROUND_COLOR = "lightgrey"
const LIGHTGREY1 = "#ececec"

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

    <View style={{ height: 130, marginVertical: 10, marginTop: -10 }}>
              <ScrollView horizontal style={{ marginTop: 10, height: 100 }} showsHorizontalScrollIndicator={false}>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

              </ScrollView>
              </View>
              <HeadingText text="Most Viewed Chapters" />
              <TouchableOpacity style={{margin:10,borderBottomColor:"#DCDCDC",borderBottomWidth:.2,flexDirection:'row',justifyContent:'space-between',padding:5}} >
                <View >
                <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: WIDTH, height: 120 }} >
                    <Rect width={WIDTH} height={100} />
                  </ContentLoader>
                </View>
                <View style={{margin:10,alignItems:'center',justifyContent:'center',paddingBottom:15}}>
                
                </View>
      </TouchableOpacity>
      <TouchableOpacity style={{margin:10,borderBottomColor:"#DCDCDC",borderBottomWidth:.2,flexDirection:'row',justifyContent:'space-between',padding:5}} >
                <View >
                <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: WIDTH, height: 120 }} >
                    <Rect width={WIDTH} height={100} />
                  </ContentLoader>
                </View>
                <View style={{margin:10,alignItems:'center',justifyContent:'center',paddingBottom:15}}>
                
                </View>
      </TouchableOpacity>
      <TouchableOpacity style={{margin:10,borderBottomColor:"#DCDCDC",borderBottomWidth:.2,flexDirection:'row',justifyContent:'space-between',padding:5}} >
                <View >
                <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: WIDTH, height: 120 }} >
                    <Rect width={WIDTH} height={100} />
                  </ContentLoader>
                </View>
                <View style={{margin:10,alignItems:'center',justifyContent:'center',paddingBottom:15}}>
                
                </View>
      </TouchableOpacity>
      <TouchableOpacity style={{margin:10,borderBottomColor:"#DCDCDC",borderBottomWidth:.2,flexDirection:'row',justifyContent:'space-between',padding:5}} >
                <View >
                <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: WIDTH, height: 120 }} >
                    <Rect width={WIDTH} height={100} />
                  </ContentLoader>
                </View>
                <View style={{margin:10,alignItems:'center',justifyContent:'center',paddingBottom:15}}>
                
                </View>
      </TouchableOpacity>
      <TouchableOpacity style={{margin:10,borderBottomColor:"#DCDCDC",borderBottomWidth:.2,flexDirection:'row',justifyContent:'space-between',padding:5}} >
                <View >
                <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: WIDTH, height: 120 }} >
                    <Rect width={WIDTH} height={100} />
                  </ContentLoader>
                </View>
                <View style={{margin:10,alignItems:'center',justifyContent:'center',paddingBottom:15}}>
                
                </View>
      </TouchableOpacity>
      <TouchableOpacity style={{margin:10,borderBottomColor:"#DCDCDC",borderBottomWidth:.2,flexDirection:'row',justifyContent:'space-between',padding:5}} >
                <View >
                <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: WIDTH, height: 120 }} >
                    <Rect width={WIDTH} height={100} />
                  </ContentLoader>
                </View>
                <View style={{margin:10,alignItems:'center',justifyContent:'center',paddingBottom:15}}>
                
                </View>
      </TouchableOpacity>
              <View style={{ height: 130, marginVertical: 10, marginTop: -10 }}>
              <ScrollView horizontal style={{ marginTop: 10, height: 100 }} showsHorizontalScrollIndicator={false}>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

              </ScrollView>
              </View>
              <View style={{ height: 130, marginVertical: 10, marginTop: -10 }}>
              <ScrollView horizontal style={{ marginTop: 10, height: 100 }} showsHorizontalScrollIndicator={false}>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

              </ScrollView>
              </View>
              <View style={{ height: 130, marginVertical: 10, marginTop: -10 }}>
              <ScrollView horizontal style={{ marginTop: 10, height: 100 }} showsHorizontalScrollIndicator={false}>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

              </ScrollView>
              </View>
              <View style={{ height: 130, marginVertical: 10, marginTop: -10 }}>
              <ScrollView horizontal style={{ marginTop: 10, height: 100 }} showsHorizontalScrollIndicator={false}>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY1} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

              </ScrollView>
              </View>
                </View>
            </View>
    </ScrollView>
</View>
    );
  }
}
