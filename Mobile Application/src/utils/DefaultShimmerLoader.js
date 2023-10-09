import React, { Component } from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native';
import { styles, WIDTH, HEIGHT, Header, GRAD1, LIGHTGREY, LIGHT_BLUE, LIGHT_GREEN, BLUE, ORANGE_NEW, BLUE_UP, NEW_GRAD1, BG_COLOR, LOGIN_BG, BLACK, WHITE} from './utils';
import ContentLoader, { Rect, Circle, Facebook, Instagram } from 'react-content-loader/native'
import HeadingText from './HeadingText';
import { AntDesign, Ionicons } from "@expo/vector-icons"
import * as Animatable from "react-native-animatable"
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import { withTheme } from 'react-native-paper';

const FOREGROUND_COLOR = "lightgrey"

export default class ShimmerLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <View style={{ padding: 8, backgroundColor: WHITE }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', }}>
          <View style={{ height: 38, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingLeft: 5 }}>
          </View>
          <Image source={require("../../assets/logo-light.png")} style={{ width: 130, resizeMode: 'contain', height: 40, paddingLeft: 25, marginLeft: 20 }} />
          <AntDesign name="bells" size={24} color="white" style={{ marginRight: 10 }} />
          <Animatable.View duration={200} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 0, borderTopRightRadius: 5, borderBottomRightRadius: 5, backgroundColor: NEW_GRAD1, width: 40, height: 40, overflow: 'hidden' }}>
            {
              this.state.isSearchOpen ?
                <TextInput
                  placeholder="Search"
                  style={{ width: 350, height: 40, backgroundColor: 'white', textAlign: 'center' }}
                />
                :
                <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="ios-search" color={"white"} size={22} />
                </TouchableOpacity>
            }
          </Animatable.View>
        </View>
        <ScrollView scrollEnabled={false}>
          <View style={{ flex: 1 }}>
             <View style={{ flex: 1, backgroundColor:BLACK, height: 180,  }}>
            <View style={{ overflow: 'hidden', borderRadius: 10, width: WIDTH - 20, height: 150, }}>
              <ContentLoader speed={.6} backgroundColor={LIGHTGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: WIDTH - 20, borderRadius: 10, height: 150 }}>
                <Rect width={WIDTH} height={150} />
                {/* <Rect  width={WIDTH} height={100} /> */}
              </ContentLoader>
            </View>

            <View style={{ marginVertical: 10, position: 'absolute', top: heightPercentageToDP(20) }}>
              <View style={{ flex: 1, backgroundColor: BLACK, width: widthPercentageToDP(100), marginTop: heightPercentageToDP(2), paddingBottom: heightPercentageToDP(3), alignItems: 'center', paddingRight: 20 }}>
                {/* Course Type */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: heightPercentageToDP(10), marginTop: heightPercentageToDP(1), position: 'absolute', top: -heightPercentageToDP(8), right: 13 }}>
                  <TouchableOpacity activeOpacity={.8}>
                    <LinearGradient start={{ x: 0, y: 1 }}
                      end={{ x: 1, y: 1 }} colors={["#ff0095", "#ff5500"]} style={{ width: widthPercentageToDP(45), height: heightPercentageToDP(8), justifyContent: 'center', alignItems: 'center', borderRadius: widthPercentageToDP(1.5), margin: heightPercentageToDP(1), elevation: 4, flexDirection: 'row' }}>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.8}>
                    <LinearGradient start={{ x: 0, y: 1 }}
                      end={{ x: 1, y: 1 }} colors={["#2562e6", "#1F3085",]} style={{ width: widthPercentageToDP(45), height: heightPercentageToDP(8), justifyContent: 'center', alignItems: 'center', borderRadius: widthPercentageToDP(1.5), margin: heightPercentageToDP(1), elevation: 4, flexDirection: 'row' }}>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: heightPercentageToDP(10), marginTop: heightPercentageToDP(2) }}>
                  <TouchableOpacity activeOpacity={.8}>
                    <LinearGradient start={{ x: 0, y: 1 }}
                      end={{ x: 1, y: 1 }} colors={["#52a442", "#85b640"]} style={{ width: widthPercentageToDP(45), height: heightPercentageToDP(8), justifyContent: 'center', alignItems: 'center', borderRadius: widthPercentageToDP(1.5), margin: heightPercentageToDP(1), elevation: 4, flexDirection: 'row' }}>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.8}>
                    <LinearGradient start={{ x: 0, y: 1 }}
                      end={{ x: 1, y: 1 }} colors={["#18a996", "#22546b",]} style={{ width: widthPercentageToDP(45), height: heightPercentageToDP(8), justifyContent: 'center', alignItems: 'center', borderRadius: widthPercentageToDP(1.5), margin: heightPercentageToDP(1), elevation: 4, flexDirection: 'row' }}>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                {/* Course Type */}
              </View>
              </View>
            </View>

            <View style={{ height: 160, marginVertical: 10, marginTop: heightPercentageToDP(12) }}>
              <HeadingText text="Recently Played" />

              <ScrollView horizontal style={{ marginTop: 10, height: 100 }} showsHorizontalScrollIndicator={false}>
                <View style={{ margin: 5, borderRadius: 8, width: 120, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 120, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 120, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

              </ScrollView>
            </View>

            <View style={{ height: 160, marginVertical: 10 }}>
              <HeadingText text="Subjects" />

              <ScrollView horizontal style={{}} showsHorizontalScrollIndicator={false}>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LIGHTGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>
              </ScrollView>
            </View>

            <ScrollView style={{ marginVertical: 5, }}>
              <HeadingText text="Categories" />

              <View style={{ overflow: 'hidden', borderRadius: 10, width: WIDTH - 20, height: 150, marginVertical: 5 }}>
                <ContentLoader speed={.6} backgroundColor={LIGHTGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: WIDTH - 20, borderRadius: 10, height: 150, }}>
                  <Rect width={WIDTH} height={150} />
                  {/* <Rect  width={WIDTH} height={100} /> */}
                </ContentLoader>
              </View>
              <View style={{ overflow: 'hidden', borderRadius: 10, width: WIDTH - 20, height: 150, }}>
                <ContentLoader speed={.6} backgroundColor={LIGHTGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: WIDTH - 20, borderRadius: 10, height: 150, }}>
                  <Rect width={WIDTH} height={150} />
                  {/* <Rect  width={WIDTH} height={100} /> */}
                </ContentLoader>
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  }
}
