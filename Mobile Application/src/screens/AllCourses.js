import React, { Component } from 'react';
import { StyleSheet, View, Animated, ScrollView, Dimensions, Style, Image, FlatList, Picker, AsyncStorage, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Header, WIDTH, HEIGHT, LIGHTGREY, BG_COLOR, NEWBLUE, LINEGREY, LIGHT_BLUE, BLUE, BORDER_RADIUS, BORDER_RADIUS_BUY_BUTTON, TAB_BG_COLOR } from '../utils/utils';
import { BASE_URL, fetchProducts, fetchAllProducts, fetchExams, fetchCourses, fetchProductsCoursesWise, fetchProductsExamWise } from '../utils/configs';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Loader from '../utils/Loader';
import HeadingText from '../utils/HeadingText';
import Text from './components/CustomFontComponent';
import BlankError from '../utils/BlankError';
import AwesomeAlert from 'react-native-awesome-alerts';
import Star from 'react-native-star-view';
import { Block } from "expo-ui-kit"


const Screen = {
  height: Dimensions.get('window').height
};

export default class AllCourses extends Component {
  constructor(props) {
    super(props);
    this._deltaY = new Animated.Value(0);
    this.state = {
      canScroll: false,
      loading: true,
      subjects: [],
      offset: 0,
      loadingMore: true,
      token: '',
      packageLocked: false,
      selectedExam: null,
      selectedCourse: null,
      exams: [],
      courses: [],
    };
  }

  componentDidMount = async () => {
    AsyncStorage.getItem("user_token").then(token => {
      this.setState({
        token: token
      })
      fetchAllProducts(token, this.state.offset,)
        .then(res => {
          console.log("PRODUCT LIST")
          if (res.success) {
            console.log(res)
            this.setState({
              loading: false,
              products: res.products,
              loadingMore: false
            })
          }
        })

      fetchExams(token, this.state.offset).then(data => {
        var items = [];
        data.exams.map((item, index) => {
          const value = {
            id: item.id,
            name: item.name
          };
          items.push(value);
        })
        this.setState({
          exams: items
        })
      })


      fetchCourses(token, this.state.offset).then(data => {
        var items = [];
        data.courses.map((item, index) => {
          const value = {
            id: item.id,
            name: item.name
          };
          items.push(value);
        })
        this.setState({
          courses: items
        })
      })
    })
  }

  fetchproductItemWise(item) {
    console.log(item)
    console.log(this.state.token)
    fetchProductsCoursesWise(item, this.state.token, 1)
      .then(res => {
        console.log("PRODUCT LIST")
        console.log(res)
        if (res.success) {
          console.log(res)
          this.setState({
            loading: false,
            products: res.products,
            loadingMore: false
          })
        }
      })
  }

  fetchproductItemExamWise(item) {
    console.log(item)
    console.log(this.state.token)
    fetchProductsExamWise(item, this.state.token, 1)
      .then(res => {
        console.log("PRODUCT LIST")
        console.log(res)
        if (res.success) {
          console.log(res)
          this.setState({
            loading: false,
            products: res.products,
            loadingMore: false
          })
        }
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
    fetchAllProducts(this.state.token, this.state.offset,).then(data => {
      if (data.products.length != 0) {

        this.setState({
          products: [...this.state.products, ...data.products],
          loadingMore: false
        })
      } else {
        this.setState({
          loadingMore: false
        });
      }
    });
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
            <View style={{ height: widthPercentageToDP(20), padding: 5, justifyContent: 'center', marginLeft: 15 }} >
              <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(2.5), width: widthPercentageToDP(60) }} >{item.name}</Text>
              <Text numberOfLines={2} style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(2), width: widthPercentageToDP(60) }} >{item.description}</Text>
              <Text style={{ color: LIGHTGREY, fontSize: heightPercentageToDP(2), fontFamily: 'Lato-Bold', width: widthPercentageToDP(60) }} > {'\u20B9'} {item.finalAmount}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )
      :
      (

        <View style={styles.card}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseBuys", { item: item })}>
            <View style={styles.imageContainer}>
              <Image style={styles.cardImage} source={{ uri: `${BASE_URL}${item.cover_image}` }} />
              <LinearGradient colors={["transparent", "transparent"]} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} >
                {item.product_type == undefined ? null :
                  <Text numberOfLines={1} style={{ fontWeight: 'normal', fontSize: heightPercentageToDP(1.3), backgroundColor: BG_COLOR, width: heightPercentageToDP(12), color: 'white', bottom: heightPercentageToDP(-15), right: 0, padding: 5 }}>{item.product_type.title}</Text>
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
            <View style={{ flexDirection: 'row' }}>
              {item.finalAmount == 0 ? <Text style={styles.count}>Free</Text>
                :
                <Text style={styles.count}>{'\u20B9'}{item.finalAmount}</Text>
              }
              {item.finalAmount == item.amount ? null :
                <Text style={styles.count1}>{'\u20B9'}{item.amount}</Text>
              }
            </View>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("CourseBuys", { item: item })}>
              <Block center marginLeft={heightPercentageToDP(1.1)}>
                <LinearGradient colors={[BLUE, BLUE]} start={{ x: 1, y: 0.8 }} end={{ x: 1, y: 0 }} style={{ padding: 10, width: widthPercentageToDP(40), borderRadius: BORDER_RADIUS_BUY_BUTTON, marginTop: heightPercentageToDP(1), alignSelf: 'center' }}>
                  <Text style={{ fontSize: heightPercentageToDP(1.3), fontWeight: 'bold', textAlign: 'center', color: 'white', borderRadius: 4, justifyContent: 'center' }}>Buy Now</Text>
                </LinearGradient>
              </Block>

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
        <Header backIcon onbackIconPress={() => this.props.navigation.goBack()} title="ACME Academy Courses" />
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginTop: 20, justifyContent: 'space-between' }}>
            <View style={[styles.pickerWrapper, { width: widthPercentageToDP(45) }]}>
              <Picker
                placeholder="Select Exam"
                placeholderStyle={{ color: "white", }}
                placeholderIconColor={"white"}
                style={{ margin: 5, height: heightPercentageToDP(5) }}
                selectedValue={this.state.selectedExam}
                mode="dropdown"
                onValueChange={(itemValue, itemIndex) => {
                  this.setState({ selectedExam: itemValue }, this.fetchproductItemExamWise(itemValue))
                }}>
                <Picker.Item label={"Select Exam"} color={LIGHTGREY} value={null} />
                {
                  this.state.exams.map((item, index) => {
                    return <Picker.Item label={item.name} color={LIGHTGREY} value={item.id} />
                  })
                }
                {/* {this.state.loadingMore ? this._renderFooter() : null} */}
              </Picker>
            </View>
            <View style={[styles.pickerWrapper, { width: widthPercentageToDP(45) }]}>
              <Picker
                placeholder="Select Course"
                placeholderStyle={{ color: "white", }}
                placeholderIconColor={"white"}
                mode="dropdown"
                style={{ margin: 5, height: heightPercentageToDP(5) }}
                selectedValue={this.state.selectedCourse}
                onValueChange={(itemValue, itemIndex) => {
                  this.setState({ selectedCourse: itemValue }, this.fetchproductItemWise(itemValue))
                }}>
                <Picker.Item label={"Select Course"} color={LIGHTGREY} value={null} />
                {
                  this.state.courses.map((item, index) => {
                    return <Picker.Item label={item.name} color={LIGHTGREY} value={item.id} />
                  })
                }
                {/* {this.state.loadingMore ? this._renderFooter() : null} */}
              </Picker>
            </View>
          </View>
        </View>
        {/* <HeadingText text={"Subjects in " + this.state.item.name} /> */}
        {this.state.products.length == 0 ? <BlankError text="Nothing found" />
          :
          <FlatList
            refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />}
            ListFooterComponent={this._renderFooter}
            onEndReachedThreshold={.5}
            numColumns={2}
            onEndReached={this.loadMore}
            data={this.state.products}
            style={{ marginTop: 30, marginLeft: heightPercentageToDP(1) }}
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
    backgroundColor: '#f2f2f2'
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
  /******** card **************/
  card: {
    marginVertical: 8,
    backgroundColor: "#fff",
    width: widthPercentageToDP(45),
    borderRadius: BORDER_RADIUS,
    marginHorizontal: 5.5,
    marginTop: 10
  },
  cardContent: {
    paddingVertical: 15,
    justifyContent: 'space-between',
    marginRight: 10,
  },
  cardImage: {
    flex: 1,
    height: heightPercentageToDP(18),
    width: null,
    borderRadius: 4,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    resizeMode: 'cover'
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
    fontFamily: 'Lato-Medium',
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
    fontFamily: 'Lato-Bold',
    color: "#07a1e8",
    marginLeft: 10
  },
  count1: {
    fontSize: 12,
    fontWeight: 'normal',
    color: BG_COLOR,
    marginTop: 1.5,
    marginLeft: 10,
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  pickerWrapper: {
    borderColor: LIGHTGREY,
    borderWidth: .2,
    backgroundColor: "white",
    borderRadius: 4,
    margin: 10
  },
  pickerIcon: {
    color: BG_COLOR,
    position: "absolute",
    bottom: 15,
    right: 13,
    fontSize: 20,
    backgroundColor: "white",
    width: 20,
    height: 20,
    borderRadius: 10,

  },
  pickerContent: {
    color: "lightgrey",
    backgroundColor: "transparent",
  },
  starStyle: {
    width: 60,
    height: 12,
    marginLeft: 10,
    color: '#FDCC0D',
    tintColor: '#FDCC0D'
  }
});
