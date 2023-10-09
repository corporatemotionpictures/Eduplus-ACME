import React, { Component } from 'react';
import { View, Text, TextInput, Platform, ImageBackground, Share, StyleSheet, Image, SafeAreaView, TouchableHighlight, KeyboardAvoidingView, AsyncStorage, Alert, TouchableOpacity, Modal, ScrollView, StatusBar, Keyboard } from 'react-native';
import { ApplicationProvider, Layout, Input, Button, } from "@ui-kitten/components"
import { mapping, dark as darkTheme } from '@eva-design/eva';
import WebView from "react-native-webview"
import { AntDesign, Ionicons, FontAwesome, Entypo } from "@expo/vector-icons"
import { HEIGHT, WIDTH, GREEN, GREY, Header, styles, LIGHT_BLUE, BLUE, BLUE_UP, GRAD1, GRAD2, SECONDARY_COLOR, NEW_GRAD1, NEW_GRAD2, WHITE, BLACK, RedMunsell, BG_COLOR } from '../utils/utils';
import { BASE_URL, BASE_URL_LOGIN, CLIENT_ID, FACEBOOK_CLIENT_ID, GOOGLE_CLIENT_ID, checkUserAuth, raiseTicketWithoutLogin, fetchReferAndEarn } from '../utils/configs';
import { LinearGradient } from "expo-linear-gradient"
import LottieView from "lottie-react-native";
import AwesomeAlert from 'react-native-awesome-alerts';
import Loader from '../utils/Loader';
import DeivceInfo, { getDeviceId, getUniqueId, getSystemName, getDeviceName, getModel, getSerialNumberSync, getSerialNumber, getBrand } from "react-native-device-info";
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import Video from 'react-native-video';


export default class ReferAndEarn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            TextInputValueHolder: 'ASDSDFEF',
            refercode: '',
            loading: true
        };
    }

    componentWillMount() {
        AsyncStorage.getItem("user_name").then((name) => {
            this.setState({
                userDetails: name
            })
            console.log(this.state.userDetails)
        })
        AsyncStorage.getItem("user_token").then(token => {
            this.setState({
                token: token
            })
            fetchReferAndEarn(token)
                .then(res => {
                    if (res.success) {
                        console.log(res)
                        this.setState({
                            referdata: res,
                            referraldetail: res.referralCode,
                            loading: false,
                        })
                        console.log("REFER AND EARN DETAILS")
                        console.log(this.state.referdata)
                    }
                })
        })

    }

    ShareMessage = () => {
        Share.share(
            {
                message: `Hey, I have gifted you ACME Academy Learning Discount Code. Buy your courses at discounted price. Signup on https://eduplus.igate.guru/ Use my referral code ${this.state.referdata.referralCode.code.toString()} Get discount of min ${this.state.referdata.minReferrarAmount} and max ${this.state.referdata.maxReferrarAmount} on all products. Enjoy! Thank me later!`
            }).then(result => console.log(result)).catch(errorMsg => console.log(errorMsg));
    }

    render() {
        return this.state.loading ? <Loader /> : (
            // <ScrollView>
            <ScrollView>
                <ApplicationProvider
                    mapping={mapping}
                    theme={darkTheme}>
                    {/* <ScrollView style={{height:  HEIGHT,}}> */}
                    <Layout style={{ flex: 1, height: HEIGHT, backgroundColor: 'white' }}>
                        <LinearGradient colors={["#E52940", "#FF824E"]}>
                            <StatusBar backgroundColor={BG_COLOR} barStyle="light-content" />
                        </LinearGradient>

                        {/* <Image source={require("../../assets/bg-min.jpg")}
                            style={{
                                width: WIDTH, height: '100%',
                                position: 'absolute',
                            }}
                            resizeMode="cover"
                        /> */}
                        <View
                            style={{
                                width: WIDTH, height: '22%',
                                position: 'absolute',
                                backgroundColor: BG_COLOR
                            }}
                        />

                        <View style={{ alignSelf: 'center', marginTop: heightPercentageToDP(10) }}>
                            <Text style={{ textAlign: 'center', color: '#ffffff', fontSize: heightPercentageToDP(2.8), fontWeight: 'bold' }}>Refer Your Friend And {"\n"} Earn Discount</Text>
                            <Image source={require("../../assets/coupon.png")}
                                style={{ width: 220, resizeMode: 'contain', height: 70, marginTop: heightPercentageToDP(1) }} />
                        </View>

                        <KeyboardAvoidingView style={{ flex: 3 }} >
                            <View style={{ height: HEIGHT, backgroundColor: WHITE, borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: heightPercentageToDP(10) }}>
                                <View style={{ height: hp("30%"), position: 'absolute', top: hp("4%"), alignItems: 'flex-start', justifyContent: "flex-start", alignItems: 'center', alignSelf: 'center' }}>
                                    <TouchableOpacity style={{ backgroundColor: '#E8F1FC', ...mystyles.card }}>
                                        {/* <View style={{ flexDirection: 'row' }}>
                                            <Image
                                                source={require('../../assets/discount.png')}
                                                style={{ width: 40, height: 40, alignSelf: 'flex-start' }}
                                            />
                                            <Text style={{ textAlign: 'center', left: 5, fontSize: heightPercentageToDP(1.5), width: widthPercentageToDP(70) }} numberOfLines={2} wrap size={8} marginTop={1} center>Share your refrel code and invite yout friend and earn min {this.state.referdata.minReferrarAmount} and max {this.state.referdata.maxReferrarAmount} </Text>
                                        </View> */}
                                        <Text style={{ textAlign: 'center', fontSize: heightPercentageToDP(1.8), fontWeight: 'bold' }}>Hi {this.state.userDetails}, </Text>
                                        <Text style={{ textAlign: 'center', left: 5, fontSize: heightPercentageToDP(1.5), width: widthPercentageToDP(70) }} numberOfLines={2} wrap size={8} marginTop={1} center>Get a min {this.state.referdata.minReferrarAmount} and max {this.state.referdata.maxReferrarAmount} off all products for each referral</Text>
                                        <Text style={{ textAlign: 'center', left: 5, fontSize: heightPercentageToDP(1.5), width: widthPercentageToDP(70) }} numberOfLines={2} wrap size={8} marginTop={1} center>Your Friends get min {this.state.referdata.minReferrarAmount} and max {this.state.referdata.maxReferrarAmount} off all products!</Text>
                                    </TouchableOpacity>

                                    <View style={mystyles.cardContainer}>
                                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                            <Image source={{ uri: 'https://image.flaticon.com/icons/png/512/3579/3579045.png' }} style={mystyles.imgsize}
                                            />
                                            <Text style={mystyles.Title}>Refer Your Friend{'\n'} via below code</Text>
                                        </View>
                                        <View style={mystyles.arrowContainer}>
                                            <Image source={{ uri: 'https://image.flaticon.com/icons/png/512/892/892534.png' }} style={mystyles.arrowSize}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                            <Image source={{ uri: 'https://image.flaticon.com/icons/png/512/1162/1162456.png' }} style={mystyles.imgsize}
                                            />
                                            <Text style={mystyles.Title}>Your Friend get{'\n'} course from us</Text>
                                        </View>
                                        <View style={mystyles.arrowContainer}>
                                            <Image source={{ uri: 'https://image.flaticon.com/icons/png/512/892/892534.png' }} style={mystyles.arrowSize}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                            <Image source={{ uri: 'https://image.flaticon.com/icons/png/512/3179/3179668.png' }} style={mystyles.imgsize}
                                            />
                                            <Text style={mystyles.Title}> You and your{'\n'} friend get rewarded</Text>
                                        </View>
                                    </View>

                                    {/* <View style={{ flexDirection: 'column' }}>
                                        <View style={{ width: widthPercentageToDP(100), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: heightPercentageToDP(1), marginLeft: 5, marginRight: 5 }}>
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate("OrderList")} activeOpacity={.8}>
                                                <Text numberOfLines={3} style={{ width: widthPercentageToDP(30), textAlign: 'center', color: 'black', fontSize: heightPercentageToDP(1.8) }}>
                                                    Invite Your Friend via below code
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => this.props.navigation.navigate("CartList")} activeOpacity={.8}>
                                                <Text numberOfLines={3} style={{ width: widthPercentageToDP(30), textAlign: 'center', color: 'black', fontSize: heightPercentageToDP(1.8), margin: 5 }}>
                                                    Your Friend get course from us
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => this.props.navigation.navigate("OrderListPrime")} activeOpacity={.8}>
                                                <Text numberOfLines={3} style={{ width: widthPercentageToDP(30), textAlign: 'center', color: 'black', fontSize: heightPercentageToDP(1.8), margin: 5 }}>
                                                    You and your friend get rewarded
                                                </Text>
                                            </TouchableOpacity>

                                        </View>
                                    </View> */}


                                    <TouchableHighlight onPress={this.ShareMessage} style={{
                                        backgroundColor: BLUE, width: WIDTH - 90, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, overflow: 'hidden', marginTop: heightPercentageToDP(5), borderWidth: 1,
                                        borderStyle: 'dashed',
                                        borderColor: GREY,
                                    }}>
                                        <LinearGradient colors={["#ADD8E6", "#ADD8E6"]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }} >
                                            <TextInput
                                                editable={false}
                                                onChangeText={(TextInputText) => { this.setState({ TextInputValueHolder: TextInputText }) }}
                                                style={{ fontWeight: 'bold', color: 'black', fontSize: 18 }}>
                                                {this.state.referdata.referralCode.code}
                                            </TextInput>
                                        </LinearGradient>
                                    </TouchableHighlight>

                                    <TouchableHighlight onPress={this.ShareMessage} style={{ backgroundColor: LIGHT_BLUE, width: WIDTH - 180, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 60, overflow: 'hidden', marginTop: heightPercentageToDP(5) }}>
                                        <LinearGradient colors={[LIGHT_BLUE, LIGHT_BLUE]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', }} >
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text numberOfLines={2} style={{ color: 'white', fontSize: 16, margin: 10, fontWeight: 'bold' }}>
                                                    REFER NOW
                                                </Text>
                                                <Entypo name="share" size={20} color="white" style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center', alignContent: 'center' }} />
                                            </View>
                                        </LinearGradient>
                                    </TouchableHighlight>

                                    {/* <View style={{ marginTop: heightPercentageToDP(2), marginBottom: heightPercentageToDP(2) }}>
                                        <Text style={{ alignSelf: 'center' }}>OR</Text>
                                    </View> */}

                                </View>
                            </View>
                        </KeyboardAvoidingView>

                    </Layout>
                    {/* </ScrollView> */}
                </ApplicationProvider>
            </ScrollView>

        );
    }
}

const mystyles = StyleSheet.create({
    card: {
        alignSelf: 'center',
        height: null,
        width: widthPercentageToDP(90),
        borderRadius: 10,
        marginTop: -60,
        padding: 15
    },
    cardContainer: {
        justifyContent: 'space-evenly',
        alignSelf: 'center',
        flexDirection: 'row',
        padding: 8,
        width: '100%',
        marginTop: 10,
        backgroundColor: 'transparent',
        height: 110,
    },
    Title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#000000',
        textAlign: 'center'
    },
    imgsize: {
        height: 50,
        width: 50,
        marginTop: 10,
    },
    arrowSize: {
        height: 30,
        width: 30,
        tintColor: '#000000'
    },
    arrowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }

});