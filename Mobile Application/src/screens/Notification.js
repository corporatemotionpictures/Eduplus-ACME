import React, { Component } from 'react';
import { View, Text, AsyncStorage, FlatList, StyleSheet, Image,RefreshControl, ScrollView } from 'react-native';
import { styles, Header, LIGHTGREY } from '../utils/utils';
import { fetchNotifications, fetchNotificationsforall } from '../utils/configs';
import HeadingText from '../utils/HeadingText';
import Loader from '../utils/Loader';
import BlankError from '../utils/BlankError';
import moment from "moment"
import AntDesign from "react-native-vector-icons/AntDesign"
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';

export default class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      loading: true
    };
  }

  onRefresh = () => {
    this.componentDidMount();
  }

  componentDidMount() {
    AsyncStorage.getItem("user_id").then(id => {
      AsyncStorage.getItem("user_token").then(token => {
        fetchNotificationsforall(token).then(data => {
          if (data.success) {
            this.setState({
              notifications: data.pushNotifications,
              loading: false
            })
            console.log(this.state.notifications)

            // Object.keys(this.state.notifications).map(created_at => {
            //   return (
            //    this.state.notifications[created_at].map( data => {
            //       return (
            //         console.log(">>>>>>>>>>>>>>>>>>><<<<<<<<<<"),
            //         console.log(data)
            //       )
            //    })
            //   )
            // })

            // const newArrayList = [];
            // this.state.notifications.forEach(obj => {
            //   if (!newArrayList.some(o => o.created_at === obj.created_at)) {
            //     newArrayList.push({...obj});
            //   }
            // });
            // this.setState({notifications: newArrayList}); 
          }
        })
      })
    })
  }

  renderNotification = ({ item, index }) => {
    var a = new Date(item.created_at);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = (a.getHours()+ 24) % 12 || 12;
    var ampm = hour >= 12 ? 'PM' : 'AM';
    var min = a.getMinutes();
    var time = date + ' ' + month + ' ' + year + ' ' + '/' + ' ' + hour + ' ' + ':' + min + ' ' + ampm;
    return (
      <View style={styles.card} >
        <View style={{ flexDirection: 'column' }}>
        
        {/* {index > 0 && this.state.notifications[index].created_at === this.state.notifications[index - 1].created_at ? null
        :
        <View style={{ width: widthPercentageToDP(95), backgroundColor: "#f1f1f1", height: 30, marginTop: 2 }}>
            <Text style={{ fontSize: heightPercentageToDP(1.5), marginTop: 8, fontFamily: 'Roboto-Regular', color: "#8b8b8b", textAlign: 'left', marginLeft: 10, justifyContent: 'center', alignContent: 'center', alignItems: 'center', }} >{time}</Text>
          </View>
        } */}
          
          <View style={{ flexDirection: 'row', padding: heightPercentageToDP(1.6),backgroundColor:'#ffffff', borderBottomColor:"#DCDCDC", borderBottomWidth:.3 }}>
            <Image source={require("../../assets/notification.png")} style={{ width: widthPercentageToDP(6), height: widthPercentageToDP(6), marginTop: heightPercentageToDP(1) }} />
            <View style={{ marginHorizontal: heightPercentageToDP(1), marginLeft: 20, }} >
              <Text numberOfLines={2} style={{ fontSize: heightPercentageToDP(2), fontFamily: 'Roboto-Bold', width: widthPercentageToDP(78), color: '#393939' }} >{item.title}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: widthPercentageToDP(90), marginTop: heightPercentageToDP(.5) }} >
                <Text numberOfLines={4} style={{ fontSize: heightPercentageToDP(1.5), width: widthPercentageToDP(78), fontFamily: 'Roboto-Bold', color: "grey" }} >{item.body}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                  {/* <Status status={notifyData.appointment.status} />*/}
                </View>
              </View>
              <Text style={{ color: 'lightgrey', fontSize: heightPercentageToDP(1.4), marginTop:4 }}>{time}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  render() {
    return this.state.loading ? <Loader /> : (
      <View style={styles.BG_STYLE}>
        <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title="Announcement &#38;	 Notifications" />
        {/* <HeadingText text="Your Notification" /> */}
        <ScrollView refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />} >
        <View style={{ flex: 1 }}>
          {
            this.state.notifications.length == 0 ?
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                <BlankError text="You don't have any notification." />
              </View>
              :
              <FlatList
                data={this.state.notifications}
                renderItem={this.renderNotification}
                //keyExtractor={(item) => item.id}
                extraData={this.state}
                keyExtractor={(item, index) => index}
                style={{ flex: 1 }}
              />
          }
        </View>
        </ScrollView>
      </View>
      
    );
  }
}


const styles1 = StyleSheet.create({
  // card: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   borderBottomColor: '#ececec',
  //   borderBottomWidth: .5
  // }
})