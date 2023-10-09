import React,{Component} from "react";
import {createStackNavigator}  from "react-navigation-stack";
import {createAppContainer} from "react-navigation";

import Subject from "./Video/Subject";
import SubjectDetails from "./SubjectDetails";
import ExamDetails from "./ExamsDetails";
import VideoPlayer from "./VideoPlayer";
import CoursesDetails from "./CourseDetails";
import YoutubeLive from "./YoutubeLive";
import MyCourseDetail from './MyCourseDetail';
import VideoList from './VideoList';
import AllChapters from "./AllChapters";
import PreviousYear from "./PreviousYear/PreviousYear";
import PdfViewer from "./PreviousYear/PdfViewer";
import Chapters from "./PreviousYear/Chapters";
import OneLinear from "./OneLinear/OneLinear"




const mainScreen = createStackNavigator({
  Subject:{
    screen:Subject,
    navigationOptions:{
      header:null
    }
  },
  SubjectDetails:{
    screen:SubjectDetails,
    navigationOptions:{
      header:null
    }
  },
  ExamDetails:{
    screen:ExamDetails,
    navigationOptions:{
      header:null
    }
  },
  CourseDetails:{
    screen:CoursesDetails,
    navigationOptions:{
      header:null
    }
  },
  YoutubeLive: {
    screen: YoutubeLive,
    navigationOptions: {
      header: null
    }
  },
  MyCourseDetail: {
    screen: MyCourseDetail,
    navigationOptions: {
      header: null
    }
  },

  VideoList: {
    screen: VideoList,
    navigationOptions: {
      header: null
    }
  },
  
  VideoPlayer:{
    screen:VideoPlayer,
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
  OneLinear:{
    screen:OneLinear,
    navigationOptions:{
      header:null
    }
  },


  })
 
const Main = createAppContainer(mainScreen)

export default Main