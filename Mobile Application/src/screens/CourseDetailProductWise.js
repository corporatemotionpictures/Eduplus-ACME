import React, { Component } from 'react';
import { StyleSheet, View, Animated, Dimensions, Image, Text, FlatList, AsyncStorage, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Header, LIGHTGREY, BLUE } from '../utils/utils';
import { BASE_URL, fetchProductsCoursesWise } from '../utils/configs';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Loader from '../utils/Loader';
import BlankError from '../utils/BlankError';
import AwesomeAlert from 'react-native-awesome-alerts';
import Star from 'react-native-star-view';
const regex = /(<([^>]+)>)/ig;

const Screen = {
  height: Dimensions.get('window').height
};

export default class CourseDetailProductWise extends Component {
  constructor(props) {
    super(props);
    this._deltaY = new Animated.Value(0);
    this.state = {
      canScroll: false,
      loading: true,
      subjects: [],
      item: this.props.navigation.state.params.item,
      offset: 0,
      loadingMore: true,
      token: '',
      packageLocked: false
    };
  }


  componentDidMount() {
    AsyncStorage.getItem("user_token").then(token => {
      this.setState({
        token: token
      })
      fetchProductsCoursesWise(this.state.item.id, token, this.state.offset,)
        .then(res => {
          if (res.success) {
            console.log(res)
            this.setState({
              loading: false,
              subjects: res.products,
              loadingMore: false
            })
          }
        })
    })
  }

  loadMore = () => {
    this.setState({
      offset: this.state.offset + 10,
      loadingMore: true
    }, () => {
      this.fetchMore()
    })
  }

  fetchMore = () => {
    const offset = this.state.offset
    fetchProductsCoursesWise(this.state.item.id, this.state.token, this.state.offset,).then(data => {
      console.log("DATA FETCH MORE")
      console.log(data)
      if (data.products.length != 0) {

        this.setState({
          subjects: [...this.state.products, ...data.products],
          loadingMore: false
        })
        console.log("FETCH MORE")
        console.log(this.state.subjects);
      } else {
        this.setState({
          loadingMore: false
        });
      }
    });
  }

  _renderFooter = () => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', height: heightPercentageToDP(8) }}>
        { this.state.loadingMore ? <ActivityIndicator size="large" /> : null}
      </View>
    )
  }


  renderData = ({ item, index }) => {
    return item.locked ?
      (
        <TouchableOpacity onPress={() => this.setState({ packageLocked: true })} >
          <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center', borderBottomColor: '#ececec', borderBottomWidth: .5 }}>
            <View style={{ margin: 5, borderRadius: widthPercentageToDP(10), overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
              <Image source={{ uri: `${BASE_URL}${item.cover_image}` }} style={{ height: widthPercentageToDP(20), width: widthPercentageToDP(20), borderRadius: widthPercentageToDP(10) }} />
              <View style={{ backgroundColor: 'black', opacity: .3, position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                <AntDesign name="lock1" size={heightPercentageToDP(5)} color="white" />
              </View>
              <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                <AntDesign name="lock1" size={heightPercentageToDP(5)} color="white" />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: LIGHTGREY, fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
              {/* <Text numberOfLines={2} style={{color:LIGHTGREY, fontSize:12}}>{item.description.replace(regex, '')}</Text> */}
              <Text style={{ color: '#000000', fontSize: 18, fontWeight: 'bold' }}>{'\u20B9'} {item.finalAmount}</Text>
              {/* <Text style={{color:LIGHTGREY, fontSize:14}}>{item.product.model}</Text> */}
              <Star score={item.average_review} style={styles.starStyle} />
              {/* <View style={{flexDirection:'row'}} >
                    <Ionicons name="ios-star" color="gold" size={heightPercentageToDP(1.5)} style={{margin:heightPercentageToDP(.5)}}  />
                    <Ionicons name="ios-star" color="gold" size={heightPercentageToDP(1.5)} style={{margin:heightPercentageToDP(.5)}}/>
                    <Ionicons name="ios-star" color="gold" size={heightPercentageToDP(1.5)} style={{margin:heightPercentageToDP(.5)}}/>
                    <Ionicons name="ios-star" color="gold" size={heightPercentageToDP(1.5)} style={{margin:heightPercentageToDP(.5)}}/>
                    <Ionicons name="ios-star" color="gold" size={heightPercentageToDP(1.5)} style={{margin:heightPercentageToDP(.5)}}/>
                    <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(2), margin:heightPercentageToDP(.5) }} >4.5  (123,56)</Text>
                </View> */}
            </View>
          </View>
        </TouchableOpacity>
      )
      :
      (
        // <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseBuys", { item: item })} >
        //     <View style={{flexDirection:'row',alignItems:'center',borderBottomColor: LINEGREY,borderBottomWidth:.5,padding:10}}>
        //     <Image source={{ uri: `${BASE_URL}${item.cover_image}` }} style={{ height: widthPercentageToDP(15), width: widthPercentageToDP(15), justifyContent:'center', alignItems:'center', alignSelf:'center'}} />
        //       <View style={{flex:1, marginLeft:10}}>
        //           <Text style={{color:LIGHTGREY, fontSize:15, fontWeight:'normal'}}>{item.name}</Text>
        //           {/* <Text numberOfLines={2} style={{color:LIGHTGREY, fontSize:12}}>{item.description.replace(regex, '')}</Text> */}
        //           <Text style={{color:NEWBLUE, fontSize:16, fontWeight:'bold', marginTop:5}}>{'\u20B9'}{item.finalAmount}</Text>
        //           {/* <Text style={{color:LIGHTGREY, fontSize:14}}>{item.product.model}</Text> */}
        //           <View style={{flexDirection:'row', marginTop:5}} >
        //         <Ionicons name="ios-star" color="gold" size={heightPercentageToDP(1.5)} style={{margin:heightPercentageToDP(.2)}}  />
        //         <Ionicons name="ios-star" color="gold" size={heightPercentageToDP(1.5)} style={{margin:heightPercentageToDP(.2)}}/>
        //         <Ionicons name="ios-star" color="gold" size={heightPercentageToDP(1.5)} style={{margin:heightPercentageToDP(.2)}}/>
        //         <Ionicons name="ios-star" color="gold" size={heightPercentageToDP(1.5)} style={{margin:heightPercentageToDP(.2)}}/>
        //         <Ionicons name="ios-star" color="gold" size={heightPercentageToDP(1.5)} style={{margin:heightPercentageToDP(.2)}}/>
        //         <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(1.5), margin:heightPercentageToDP(.2) }} >4.5  (123,56)</Text>
        //     </View>
        //       </View>
        // </View>
        // </TouchableOpacity>
        <View style={styles.card}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseBuys", { item: item })}>
            <View style={styles.imageContainer}>
              <Image style={styles.cardImage} source={{ uri: `${BASE_URL}${item.cover_image}` }} />
              <LinearGradient colors={["transparent", "transparent"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
                {item.product_type == undefined ? null :
                  <Text numberOfLines={1} style={{ fontWeight: 'normal', fontSize: heightPercentageToDP(1.3), backgroundColor: '#07A1E8', width: heightPercentageToDP(12), color: 'white', bottom:heightPercentageToDP(-15), right: 0, padding: 5 }}>{item.product_type.title}</Text>
                }
              </LinearGradient>
            </View>
          </TouchableOpacity>
          <View style={styles.cardContent}>
            <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
            <Star score={item.average_review} style={styles.starStyle} />
            {/* <View style={{ flexDirection: 'row', marginLeft: 10, }} >
                <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
                <Ionicons name="ios-star" color='#FDCC0D' size={heightPercentageToDP(1.3)} style={{ margin: heightPercentageToDP(.2) }} />
              </View> */}
            <View style={{flexDirection:'row'}}>
                    <Text style={styles.count}>{'\u20B9'}{item.finalAmount}</Text>
                    {item.finalAmount == item.amount ? null :
                    <Text style={styles.count1}>{'\u20B9'}{item.amount}</Text>
                    }
                    </View>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseBuys", { item: item })}>
              <View style={{ marginLeft: 10, marginTop: 10, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', alignContent: 'center' }}>
                <Text style={{ fontSize: heightPercentageToDP(1.6), color: 'white', backgroundColor: BLUE, padding: 10, borderRadius: 4, justifyContent: 'center', textAlign: 'center', width: widthPercentageToDP(35) }}>Buy Now</Text>
              </View>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => addTo(item.id, 1)}>
              <Text style={{textAlign:'right', color:BLUE, fontSize:heightPercentageToDP(2), fontWeight:'bold'}}>BUY</Text>
              </TouchableOpacity> */}
          </View>
        </View>
      )
  }



  render() {
    return this.state.loading ? <Loader /> : (
      <View style={styles.container}>
        <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title={this.state.item.name} />

        {/* <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
                    <Image source={{ uri: `${BASE_URL}${this.state.item.thumbnail}` }} style={{ height: heightPercentageToDP(30), width: WIDTH }} />
                    <LinearGradient colors={["transparent", "black"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
                        <Text style={{ fontSize: heightPercentageToDP(3), color: 'white', position: 'absolute', bottom: 20, left: 10 }} >{this.state.item.name}</Text>
                    </LinearGradient>
                </View> */}
        <View style={{ marginTop: 0 }}>

        </View>
        {/* <HeadingText text={"Subjects in " + this.state.item.name} /> */}
        {this.state.subjects.length == 0 ? <BlankError text="Nothing found" /> : <FlatList
          refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />}
          ListFooterComponent={this._renderFooter}
          onEndReachedThreshold={.5}
          numColumns={2}
          style={{ flex: 1, alignSelf: 'center' }}
          onEndReached={this.loadMore}
          data={this.state.subjects}
          renderItem={this.renderData}
        />}

        <AwesomeAlert
          show={this.state.packageLocked}
          showProgress={false}
          title={`Subject Locked!`}
          message={`You have not subscribed to this subject. Please upgrade course plan to activate this subject  `}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={true}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="OK"
          confirmButtonColor={BLUE}
          onConfirmPressed={() => {
            this.setState({
              packageLocked: false
            });
          }}
        />

      </View>
    );
  }
  onSnap(event) {
    const { id } = event.nativeEvent;
    if (id === 'bottom') {
      //   this.setState({ canScroll: true });
    }
  }
  onScroll(event) {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y <= 0) {
      this.setState({ canScroll: false });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  placeholder: {
    backgroundColor: '#65C888',
    flex: 1,
    height: 120,
    marginHorizontal: 20,
    marginTop: 20
  },
  name: {
    fontSize: 28,
    color: "#696969",
    fontWeight: 'bold'
  },
  price: {
    marginTop: 10,
    fontSize: 18,
    color: "green",
    fontWeight: 'bold'
  },
  description: {
    textAlign: 'center',
    marginTop: 10,
    color: "#696969",
  },
  list: {
    paddingHorizontal: 10,
  },
  listContainer: {
    alignItems: 'center'
  },
  separator: {
    marginTop: 10,
  },
  /******** card **************/
  card: {
    marginVertical: 2,
    backgroundColor: "#f5f5f5",
    flexBasis: '47%',
    borderRadius: 4,
    marginTop: 10,
    marginHorizontal: 6,
  },
  cardContent: {
    paddingVertical: 15,
    justifyContent: 'space-between',
    marginRight: 10,
  },
  cardImage: {
    height: 180,
    width: null,
    borderRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  imageContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 6,
  },
  /******** card components **************/
  title: {
    fontSize: 12,
    flex: 1,
    color: "#000000",
    marginLeft: 10,
    fontFamily:'Roboto-Regular',
    width: 140
  },
  carddescription: {
    fontSize: 12,
    flex: 1,
    color: "#000000",
    marginLeft: 10,
    width: 140
  },
  count: {
    fontSize: 14,
    color: "#07a1e8",
    fontFamily: 'Roboto-Bold',
    marginLeft: 10
  },
  count1:{
    fontSize:12,
    fontFamily: 'Roboto-Regular',
    color:"#000000",
    marginTop:1.5,
    marginLeft:10,
    textDecorationLine: 'line-through', 
    textDecorationStyle: 'solid',
  },
  starStyle: {
    width: 60,
    height: 12,
    marginLeft: 10,
    color: '#FDCC0D',
    tintColor: '#FDCC0D'
  }
});