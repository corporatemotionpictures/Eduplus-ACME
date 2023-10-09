import { FiX } from 'react-icons/fi'
import config from 'helpers/redux/reducers/config'
import palettes from 'helpers/redux/reducers/palettes'

const Toggle = ({ title, palettes, name }) => {
  const { configValue } = config()
  let { rightSidebar } = { ...configValue }

  // const dispatch = useDispatch()
  return (
    <button
      onClick={async () => {

        window.localStorage.setItem('rightSidebar', !window.localStorage.getItem('rightSidebar'))
        window.dispatchEvent(new Event('storage'))
      }

      }
      className="btn btn-transparent btn-circle">
      <FiX size={18} />
    </button>
  )
}

export default Toggle
