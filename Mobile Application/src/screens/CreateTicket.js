import React, { Component } from 'react';
import { View, Text, ScrollView, FlatList, TextInput, TouchableHighlight, AsyncStorage, Alert } from 'react-native';
import { styles, Header, WIDTH, LIGHT_BLUE, LIGHTGREY, GRAD1, BLUE, BG_COLOR, NEW_GRAD1, NEW_GRAD2 } from '../utils/utils';
import Textarea from 'react-native-textarea';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"
import { addRaiseTickets, fetchUserDetails } from '../utils/configs';
import AwesomeAlert from 'react-native-awesome-alerts';
import Loader from '../utils/Loader';

export default class CreateTicket extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      sending: false,
      succesModal: false,
      userDetails: {},
      loading: true
    };
  }



  componentWillMount() {
    AsyncStorage.getItem("user_token").then(token => {
      AsyncStorage.getItem("user_id", (err, res) => {
        this.setState({ user_id: res })
        fetchUserDetails(res, token).then((res) => {
          if (res.success) {
            this.setState({
              userDetails: res.user,
              loading: false
            })
          } else {
            this.setState({
              loading: false
            })
            Alert.alert(res.error)
          }
        })
      })
    });
  }

  sendTicket = () => {
    this.setState({
      sending: true
    })
    AsyncStorage.getItem("user_token").then(token => {

      const message = {
        message: this.state.message
      }
      addRaiseTickets(token, message).then(data => {
        if (data.success) {
          this.setState({
            sending: false,
            succesModal: true
          })
        } else {
          this.setState({
            sending: false,
          })
        }
      }).catch(err => {
        this.setState({
          sending: false
        })
      })
    })
  }

  render() {
    return this.state.loading ? <Loader /> : (
      <View style={styles.BG_STYLE}>
        <Header title="Create Ticket" backIcon onbackIconPress={() => this.props.navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', marginTop: 20 }}>
          <TextInput
            style={{ width: WIDTH - 30, color: 'grey', backgroundColor: "white", borderColor: LIGHTGREY, borderWidth: .8, borderRadius: 4, padding: 10, marginBottom: 5 }}
            placeholder={`${this.state.userDetails.first_name} ${this.state.userDetails.last_name}`}
            editable={false}
            placeholderTextColor={"grey"}
          />
          <TextInput
            style={{ width: WIDTH - 30, color: 'grey', backgroundColor: "white", borderColor: LIGHTGREY, borderWidth: .8, borderRadius: 4, padding: 10, marginBottom: 5 }}
            placeholder={this.state.userDetails.mobile_number}
            editable={false}
            placeholderTextColor={"grey"}
          />
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Textarea
              style={{ backgroundColor: "white", color: "grey", fontSize: 17, padding: 10, }}
              onChangeText={(text) => this.setState({ message: text })}
              maxLength={120}
              placeholder={'Your Message...'}
              placeholderTextColor={LIGHTGREY}
              underlineColorAndroid={'transparent'}
              autoFocus
              containerStyle={{ borderColor: LIGHTGREY, borderWidth: .5, width: WIDTH - 30, borderRadius: 2, height: 150, marginTop: 4, paddingRight: 5 }}
            />
          </View>

        </View>
        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', bottom: 10, left: 0, right: 0 }}>
          <TouchableHighlight onPress={this.sendTicket} style={{ backgroundColor: BLUE, width: WIDTH - 30, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, position: 'absolute', bottom: 15, overflow: 'hidden' }}>
            <LinearGradient colors={[NEW_GRAD1, NEW_GRAD2]} start={{ x: -.1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', }} >
              <Text numberOfLines={2} style={{ fontFamily:'Roboto-Regular', color: 'white', fontSize: 18, margin: 10, }}>
                SEND TICKET
                            </Text>
            </LinearGradient>
          </TouchableHighlight>
        </View>

        <AwesomeAlert
          show={this.state.sending}
          showProgress={true}
          title="Sending"
          message={`Please wait..`}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={false}
        />
        <AwesomeAlert
          show={this.state.succesModal}
          showProgress={false}
          title="Raise Ticket Successful"
          message={``}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={true}
          showCancelButton={false}
          showConfirmButton={true}
          onConfirmPressed={() => {
            this.setState({
              succesModal: false
            })
            this.props.navigation.push("RaiseTicket")
          }}
          onDismiss={() => {
            this.setState({
              succesModal: false
            })
          }}
        />
        
      </View>
    );
  }
}
