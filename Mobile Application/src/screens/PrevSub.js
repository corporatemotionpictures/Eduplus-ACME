import React from "react";
import {createStackNavigator}  from "react-navigation-stack";
import {createAppContainer} from "react-navigation";


import Subject from "./PreviousYear/Subject";
import PreviousYear from "./PreviousYear/PreviousYear";
import PdfViewer from "./PreviousYear/PdfViewer";
import Chapters from "./PreviousYear/Chapters";
import AllChapters from "./AllChapters";

const PrevSub = createStackNavigator({
  Subject:{
    screen:Subject,
    navigationOptions:{
      header:null
    }
  },
  PreviousYear:{
    screen:PreviousYear,
    navigationOptions:{
      header:null
    }
  },
  PdfViewer:{
    screen:PdfViewer,
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
  AllChapters:{
    screen:AllChapters,
    navigationOptions:{
      header:null
    }
  },
 
})

export default createAppContainer(PrevSub)