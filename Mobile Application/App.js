
import { AsyncStorage, YellowBox } from "react-native"
import React, { useState, useEffect } from 'react';
import { createAppContainer } from "react-navigation";
import { createDrawerNavigator, DrawerNavigatorItems } from "react-navigation-drawer"
import { createStackNavigator } from "react-navigation-stack"
import { Text, TextInput, Picker, View } from 'react-native';
import { setCustomText } from 'react-native-global-props';
import Splash from "./src/screens/Splash"
import Login from "./src/screens/Login"
import Walkthrough from "./src/screens/Walkthrough"
import SignUp from './src/screens/SignUp';
import Main from "./src/screens/Main"
import ForgotPassword from './src/screens/ForgotPassword';
import OTP from './src/screens/OTP';
import UserInfo from './src/screens/UserInfo';
import ResetPassword from './src/screens/ResetPassword';
import Profile from "./src/screens/Profile";
import CustomDrawerContentComponent from "./src/utils/CustomDrawer";
import Videos from "./src/screens/Videos";
import Blogs from "./src/screens/Blogs";
import Paper from "./src/screens/Paper";
import Discussion from "./src/screens/Discussion";
import DeveloperContacts from "./src/screens/DeveloperContacts";
import InstituteContacts from "./src/screens/InstituteContacts";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import YoutubeHome from "./src/screens/Youtube/YoutubeHome";
import SplashScreen from "react-native-splash-screen";
import PlayList from "./src/screens/Youtube/Playlist";
import Home from "./src/screens/Home";
import Orientation from "react-native-orientation";
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import LottieView from "lottie-react-native"
import { Button } from 'react-native-paper';
import { widthPercentageToDP } from "react-native-responsive-screen";
import InAppUpdate from "./src/screens/InAppUpdate"

const initialRoute = "Splash"

console.disableYellowBox = true;

Orientation.lockToPortrait();

const customTextProps = {
    style: {
        fontFamily: 'Roboto-Regular',
    }
};

Text.defaultProps = {
    ...(Text.defaultProps || {}),
    allowFontScaling: false,
};

TextInput.defaultProps = {
    ...(TextInput.defaultProps || {}),
    allowFontScaling: false,
};

setCustomText(customTextProps)

Picker.defaultProps = {
    ...(Picker.defaultProps || {}),
    allowFontScaling: false,
};
// checkAuth();

// const colorScheme = Appearance.getColorScheme();

const DrawerMain = createDrawerNavigator({

    Home: {
        screen: Main,
    },
    Profile: {
        screen: Profile
    },
    Videos: {
        screen: Videos
    },
    Blog: {
        screen: Blogs
    },
    Paper: {
        screen: Paper
    },
    Discussion: {
        screen: Discussion
    },
    DeveloperContact: {
        screen: DeveloperContacts
    },
    InstituteContacts: {
        screen: InstituteContacts
    }
}, {
    contentComponent: CustomDrawerContentComponent,
    contentOptions: {
        activeTintColor: '#000000',
        activeBackgroundColor: '#fff',
    },
    drawerWidth: 220,
    drawerType: 'slide',
    overlayColor: '00FFFFF',
})


SplashScreen.hide()

const MyApp = createStackNavigator({

    Splash: {
        screen: Splash,
        navigationOptions: {
            header: null
        }
    },
    Main: {
        screen: DrawerMain,
        navigationOptions: {
            header: null
        }
    },

    Login: {
        screen: Login,
        navigationOptions: {
            header: null,
        }
    },
    OTP: {
        screen: OTP,
        navigationOptions: {
            header: null
        }
    },
    ResetPassword: {
        screen: ResetPassword,
        navigationOptions: {
            header: null
        }
    },

    Walkthrough: {
        screen: Walkthrough,
        navigationOptions: {
            header: null
        }
    },

    //main 
    Main: {
        screen: DrawerMain,
        navigationOptions: {
            header: null
        }
    },
    SignUp: {
        screen: SignUp,
        navigationOptions: {
            header: null
        }
    },
    ForgotPassword: {
        screen: ForgotPassword,
        navigationOptions: {
            header: null
        }
    },
    UserInfo: {
        screen: UserInfo,
        navigationOptions: {
            header: null
        }
    },

},
    {
        navigationOptions: {
            header: null,
        },

        initialRouteKey: initialRoute,
    });

let Navigation = createAppContainer(MyApp)


// <NavigationContainer>
//     <App theme="light"/>
// </NavigationContainer>

export default function App() {
    const [isInternetReachable, setIsInternetReachable] = useState(true)

    useEffect(() => {
        InAppUpdate.checkUpdate();

        //NotificationService.register(onRegister, onNotification, onOpenNotification)
        //LocalNotification.configure(onOpenNotification)
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsInternetReachable(state.isInternetReachable ?? false)
        })

        return () => {
            unsubscribe()
        }

    }, [])

    const retry = () => {
        NetInfo.addEventListener((state) => {
            // console.log("Retry......")
            setIsInternetReachable(state.isInternetReachable ?? false)
        })
    }

    return !isInternetReachable ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <LottieView source={require('./src/utils/nointernet.json')} autoPlay loop style={{ height: 300, width: 300 }} />
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'black' }}>Whoops!</Text>
            <View center marginTop={22}>
                <Text size={16}>Slow or no internet connections.</Text>
                <Text size={16}>Please check your internet settings</Text>
            </View>
            <Button style={{ marginTop: 30, backgroundColor: "#F74034", padding: 5, borderRadius: 50, width: widthPercentageToDP(70) }} icon="wifi" mode="contained" onPress={() => retry()}>
                Try Again
            </Button>
        </View>

    ) : (
        <Navigation />
    )
}

