import React, { Component } from 'react';
import { View, ScrollView, Image, TextInput, TouchableOpacity, StyleSheet, StatusBar, ImageBackground } from 'react-native';
import { styles, WIDTH, HEIGHT, Header, NEW_GRAD2, GRAD1, LIGHTGREY, LIGHT_BLUE, LIGHT_GREEN, BLUE, ORANGE_NEW, BLUE_UP, NEW_GRAD1, BG_COLOR, LOGIN_BG, BLACK, WHITE, ORANGES, LINEGREY } from './utils';
import ContentLoader, { Rect, Circle, Facebook, Instagram } from 'react-content-loader/native'
import HeadingText from './HeadingText';
import { AntDesign, Ionicons } from "@expo/vector-icons"
import * as Animatable from "react-native-animatable"
import { heightPercentageToDP as hp, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import { withTheme } from 'react-native-paper';
import { Block, Text, Card } from 'expo-ui-kit';
import Video from 'react-native-video';

const FOREGROUND_COLOR = "lightgrey"

export default class ShimmerLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <View style={{ backgroundColor: WHITE }}>

        <View style={{ width: WIDTH }}>
          <StatusBar translucent={true} backgroundColor={'transparent'} />

          <Video source={require("../../assets/login-bg.mp4")}
            style={{
              width: WIDTH, height: hp("43%"), opacity: 0.5,
              backgroundColor: BG_COLOR,
            }}
            repeat
            resizeMode="cover"
          />
          <View style={{ position: 'absolute', top: heightPercentageToDP(1.3), left: 0, right: 0 }}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center', marginTop: heightPercentageToDP(3) }}>

              <TouchableOpacity>
                <Image source={require("../../assets/menu-final.png")} style={{ height: 37, width: 30, marginLeft: heightPercentageToDP(2) }} />
              </TouchableOpacity>

              <Image source={require("../../assets/Logo-light.png")} style={{ width: 200, resizeMode: 'contain', height: 50, paddingLeft: 60, marginLeft: 5 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <LinearGradient colors={[BLUE, BLUE]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ height: 30, width: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2, marginRight: 10 }} >
                  <TouchableOpacity>
                    <View>
                      <AntDesign name="bells" size={18} color="white" style={{}} />
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
                <LinearGradient colors={[BLUE, BLUE]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ height: 30, width: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2, marginRight: 10 }} >
                  <TouchableOpacity>
                    <View>
                      <Ionicons name="ios-bookmark" size={16} color="white" style={{}} />
                    </View>
                  </TouchableOpacity>
                </LinearGradient>

              </View>


            </View>

            <Block center marginTop={heightPercentageToDP(1)}>
              <Text style={mystyles.welcomeText}>
                Grow Your Own Skill{'\n'} by Online Learning
              </Text>
            </Block>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              height: 55,
              top: 15,
              borderRadius: 8,
              width: widthPercentageToDP(80),
              alignSelf: 'center'
            }}>
              <TextInput
                style={{ fontFamily: 'Roboto-Regular', justifyContent: 'center', width: widthPercentageToDP(70), height: hp("10%"), fontSize: 16, marginLeft: heightPercentageToDP(1.5) }}
                placeholder="Search ..."
                onSubmitEditing={this.handleSearch}
                onBlur={() => this.setState({ isSearchOpen: false })}
                onChangeText={(text) => this.setState({ searchText: text })}
              />
              <TouchableOpacity>
                <LinearGradient colors={[BLUE, BLUE]} start={{ x: -.1, y: 0.2 }} end={{ x: 1, y: 0 }} style={{ height: 35, width: 35, borderRadius: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_GRAD2, right: 20 }} >
                  <TouchableOpacity>
                    <View>
                      <Ionicons name="ios-search" size={20} color="white" style={{}} />
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Block row padding={heightPercentageToDP(1)} space="evenly" marginTop={heightPercentageToDP(4)}>
              <Card
                center
                height={heightPercentageToDP(11)}
                width={widthPercentageToDP(40)}
                radius={10}
                color="#E8F1FC"
                margin={5}
                padding >

              </Card>


              <Card
                center
                height={heightPercentageToDP(11)}
                width={widthPercentageToDP(40)}
                radius={10}
                color="#FEF4EB"
                margin={5}
                padding>

              </Card>

              <Card
                center
                height={heightPercentageToDP(11)}
                width={widthPercentageToDP(40)}
                radius={10}
                color="#E5F9FB"
                margin={5}
                padding>

              </Card>

              <Card
                center
                height={heightPercentageToDP(11)}
                width={widthPercentageToDP(40)}
                radius={10}
                color="#E5F9FB"
                margin={5}
                padding>

              </Card>
            </Block>

          </View>
        </View>


        <ScrollView scrollEnabled={false}>
          <View style={{ flex: 1 }}>
            <View style={{ height: 160, marginVertical: 10, marginHorizontal: 8, marginTop: heightPercentageToDP(6) }}>
              <HeadingText text="Recently played" />

              <ScrollView horizontal style={{ height: 100 }} showsHorizontalScrollIndicator={false}>
                <View style={{ margin: 5, borderRadius: 8, width: 120, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 120, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 120, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 120, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 120, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 120, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 120, height: 100 }} >
                    <Rect width={120} height={100} />
                  </ContentLoader>
                </View>

              </ScrollView>
            </View>

            <View style={{ height: 160, marginVertical: 10, marginHorizontal: 8, marginTop: heightPercentageToDP(-3) }}>
              <HeadingText text="Subjects" />

              <ScrollView horizontal style={{}} showsHorizontalScrollIndicator={false}>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>
              </ScrollView>
            </View>

            <View style={{ height: 160, marginVertical: 10, marginHorizontal: 8, marginTop: heightPercentageToDP(-3) }}>
              <HeadingText text="Categories" />

              <ScrollView horizontal style={{}} showsHorizontalScrollIndicator={false}>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>

                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
                  </ContentLoader>
                </View>
                <View style={{ margin: 5, borderRadius: 8, width: 100, height: 100, overflow: 'hidden' }}>
                  <ContentLoader speed={.6} backgroundColor={LINEGREY} foregroundColor={FOREGROUND_COLOR} style={{ width: 100, height: 100 }} >
                    <Rect width={100} height={100} />
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

const mystyles = StyleSheet.create({
  iconRoundWrapper: {
    borderRadius: 50,
    padding: heightPercentageToDP(1.2),
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginRight: 12,
    marginLeft: 5
  },
  welcomeText: {
    color: BLACK,
    fontSize: heightPercentageToDP(2.5),
    fontWeight: 'bold'
  },
  userContainer: {
    padding: heightPercentageToDP(2),
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: heightPercentageToDP(-23)
  },
  userText: {
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
    color: "#fff",
    fontSize: heightPercentageToDP(2.5),
    marginLeft: heightPercentageToDP(2)
  },
  imgBackground: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    height: 300,
  },
  linearGradient: {
    width: '100%',
    height: 300,
    backgroundColor: 'rgba(23,24,70, .9)'

  },
  welcomeText: {
    color: WHITE,
    fontSize: heightPercentageToDP(3.6),
    fontWeight: 'bold',
    marginTop: heightPercentageToDP(2)

  }
});