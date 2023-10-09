import Switch from 'react-switch'
import {getColor} from 'components/featured/functions/colors'

import config from 'helpers/redux/reducers/config'
import palettes from 'helpers/redux/reducers/palettes'

const Component = () => {
  let onColor = `bg-blue-200`
  let onHandleColor = `bg-base`
  let offColor = `bg-gray-200`
  let offHandleColor = 'bg-white'

  const {configValue} = config()
  let {collapsed} = {...configValue}
  // const dispatch = useDispatch()

  return (
    <Switch
      onChange={() => {
        config({
          type: 'SET_CONFIG',
          config: {
            collapsed: !collapsed
          }
        })
      }}
      checked={collapsed}
      onColor={getColor(onColor)}
      onHandleColor={getColor(onHandleColor)}
      offColor={getColor(offColor)}
      offHandleColor={getColor(offHandleColor)}
      handleDiameter={24}
      uncheckedIcon={false}
      checkedIcon={false}
      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.2)"
      activeBoxShadow="0px 1px 5px rgba(0, 0, 0, 0.2)"
      height={20}
      width={48}
      className="react-switch"
    />
  )
}

const Sidebar = () => {

  return (
    <div className="flex flex-col p-4">
      <div className="uppercase text-sm font-bold tracking-wider mb-2">
        Toggle sidebar
      </div>
      <div className="flex flex-col">
        <Component />
      </div>
    </div>
  )
}

export default Sidebar
