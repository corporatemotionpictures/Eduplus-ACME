import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TouchableHighlight, Linking, AsyncStorage, ImageBackground } from 'react-native';
import { styles, Header, WIDTH, SECONDARY_COLOR, BG_COLOR, GREY, LIGHTGREY, GREEN, BLUE, LIGHT_GREEN, LIGHT_BLUE } from '../utils/utils';
import { Ionicons } from "@expo/vector-icons"
import moment from "moment"
import LottieView from "lottie-react-native"
import HeadingText from '../utils/HeadingText';
import { fetchRaiseTickets, BASE_URL } from '../utils/configs';
import BlankError from '../utils/BlankError';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';


export default class RaiseTicket extends Component {

    constructor(props) {
        super(props);
        this.state = {
            allTickets: []
        };
    }


    componentDidMount() {
        this.mobileNumber();
        AsyncStorage.getItem("user_token").then((token) => {
            fetchRaiseTickets(token).then(data => {
                if (data.success) {
                    this.setState({
                        allTickets: data.raiseTicket
                    })
                }
            })
        })
    }

    mobileNumber = async () => {
    await fetch(`${BASE_URL}/api/v1/settings/contact_numbers?onArray=true`, {
      method: "GET",
    })
      .then(response => response.json())
      .then((response) => {
        this.setState({
          callno: response.value[0],
          loading: true
        })
        console.log("CONTACT DETAIL")
        console.log(this.state.callno)
      })
      .catch(err => {
        console.error(err);
        Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")
      });
  }

    renderAllTickets = ({ item, index }) => {
        return (
            // <TouchableOpacity onPress={() => this.props.navigation.navigate("TicketDiscussArea",{item:item})} style={{height:60,margin:10,borderBottomColor:LIGHTGREY,borderBottomWidth:.5,flexDirection:'row',justifyContent:'space-between'}} >
            //         <View>
            //             <Text numberOfLines={2} style={{fontFamily:'Roboto-Regular', color:'grey',fontSize:15,width: 280,}}>{item.query}</Text>
            //         </View>
            //         <View style={{margin:10,alignItems:'center',justifyContent:'center',paddingBottom:15}}>
            //             <Text style={{fontFamily:'Roboto-Regular', color:'grey',fontSize:10,margin:5,alignItems:'center'}}>{moment(item.created_at).fromNow()}</Text>
            //             <Ionicons name="ios-arrow-forward" size={20} color="grey" />   
            //         </View>
            // </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("TicketDiscussArea",{item:item})} style={{ marginHorizontal: 10, borderBottomColor: "#ececec", borderBottomWidth: .5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: heightPercentageToDP(2) }} >
                {/* <Ionicons name="md-play-circle" size={heightPercentageToDP(4)} color={LIGHTGREY} /> */}
                <Image source={require("../../assets/comment.png")} style={{ height: heightPercentageToDP(3.8), width: heightPercentageToDP(3.8) }} />
                <View>
                    <Text numberOfLines={2} style={{ color: 'black', fontSize: 12, width: widthPercentageToDP(75), fontFamily: 'Roboto-Regular' }}>{item.query}</Text>
                    <View style={{ flexDirection: 'row', }}>
                        <Text numberOfLines={1} style={{ color: "grey", textAlign: 'center', marginTop: 5, fontSize: 10, }}>{moment(item.created_at).fromNow()}</Text>
                    </View>
                </View>
                <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', }}>
                    <Ionicons name="ios-arrow-forward" size={20} color="grey" />
                </View>
            </TouchableOpacity>
        )
    }

    call = () => {
        Linking.openURL(`tel:${this.state.callno}`)
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: "white", padding: 0 }}>
                <Header title="Raise Ticket" backIcon={true} onbackIconPress={() => this.props.navigation.goBack()} />
                <View style={{
                    backgroundColor: BG_COLOR,
                    height: 150,
                    width: WIDTH
                }}>
                    <View style={{
                        flexDirection: 'row',
                        margin: 10,
                        alignItems: 'center',
                        width: WIDTH,
                    }}>
                        <Text style={{ fontSize: 30, fontWeight: '200', color: "white", fontFamily: 'Roboto-Bold' }}>
                            We are here{"\n"}to help you.
                    </Text>
                        <LottieView
                            autoPlay
                            source={require("../utils/RaiseTicketAnimation.json")}
                            style={{ height: 150, width: 150 }}
                            hardwareAccelerationAndroid
                        />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative', bottom: 15, left: 0, right: 0, paddingHorizontal: 20 }}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate("CreateTicket")} style={{ justifyContent: 'center', alignItems: 'center', width: 150, padding: 10, borderRadius: 4, backgroundColor: LIGHT_GREEN }} >
                        <Text style={{ fontFamily: 'Roboto-Regular', color: "white", alignItems: 'center', fontSize: 13 }}><Ionicons name="ios-add" size={13} color="white" />  Create Ticket </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.call()} style={{ justifyContent: 'center', alignItems: 'center', borderColor: LIGHTGREY, borderWidth: .8, width: 150, padding: 10, borderRadius: 4, backgroundColor: BLUE }} >
                        <Text onPress={() => this.call()} style={{ fontFamily: 'Roboto-Regular', color: "white", fontSize: 13 }}><Ionicons name="md-call" size={13} color="white" />  Call Us  </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: -10 }}>
                    <HeadingText text="All Support Tickets" />
                </View>
                <View style={{ flex: 1, marginTop: 10 }}>
                    {
                        this.state.allTickets.length == 0 ? <BlankError text="Nothing Found" /> :
                            <FlatList
                                style={{ flex: 1 }}
                                data={this.state.allTickets}
                                renderItem={this.renderAllTickets}
                            />
                    }
                </View>
            </View>
        );
    }
}