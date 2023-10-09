import React from "react";
import {createStackNavigator}  from "react-navigation-stack";
import {createAppContainer} from "react-navigation";

import OneLinear from "./OneLinear/OneLinear"
import Subject from "./OneLinear/Subject"
import Chapters from "./OneLinear/Chapters"



const Paper = createStackNavigator({
  Subject:{
    screen:Subject,
    navigationOptions:{
      header:null
    }
  },
  OneLinear:{
    screen:OneLinear,
    navigationOptions:{
      header:null
    }
  },
  Chapters:{
    screen:Chapters,
    navigationOptions:{
      header:null
    }
  },

 
})

export default createAppContainer(Paper)