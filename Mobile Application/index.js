import { AppRegistry, Platform } from 'react-native';
import App from './App';
// import ZoomLive from './src/screens/components/ZoomLive'
import bgMessaging from "./bgMessaging"

AppRegistry.registerComponent('ACME Academy', () => App);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication('ACME Academy', { rootTag });
}