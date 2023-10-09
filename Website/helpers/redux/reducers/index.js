import dashboard from 'helpers/redux/reducers/dashboard'
import colors from 'helpers/redux/reducers/colors'
import config from 'helpers/redux/reducers/config'
import leftSidebar from 'helpers/redux/reducers/left-sidebar'
import palettes from 'helpers/redux/reducers/palettes'
import navigation from 'helpers/redux/reducers/navigation'
import apiReducer from 'helpers/redux/reducers/api'

const rootReducer = combineReducers({
  dashboard,
  navigation,
  colors,
  config,
  leftSidebar,
  palettes,
  apiReducer,
})

export default rootReducer
