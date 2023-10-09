import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import LiveChapter from './LiveChapter';
import { createAppContainer } from 'react-navigation';
import LivePlayer from '../../screens/LivePlayer';
import EventList from './EventList';
import ExamDetails from './ExamDetails';
import ExamLives from './ExamLives';
import CoursesDetails from './CourseDetails';
import SubjectDetails from './SubjectDetails';


const LiveStack = createStackNavigator({
    ExamLives:{
        screen:ExamLives,
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

    SubjectDetails:{
        screen:SubjectDetails,
        navigationOptions:{
            header:null
        }
    },
    
    LiveChapter:{
        screen:LiveChapter,
        navigationOptions:{
            header:null
        }
    },
    LivePlayer:{
        screen:LivePlayer,
        navigationOptions:{
            header:null
        }
    },
    EventList:{
        screen:EventList,
        navigationOptions:{
            header:null
        }
    }
});


export default createAppContainer(LiveStack)