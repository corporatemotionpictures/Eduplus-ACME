import Portal from 'components/functional-ui/portal'
import { FiX } from 'react-icons/fi'
import palettes from 'helpers/redux/reducers/palettes'

export default function (props) {

  const background = palettes()

  const { title, body, icon, buttonClassName, buttonTitle } = props

  return (
    <>

      <Portal selector="#portal">
        <div className="modal-backdrop fade-in"></div>
        <div
          className={`modal show ${background === 'dark' ? 'dark' : ''}`}
          data-background={background}>
          <div
            className="relative w-auto lg:my-4 mx-auto lg:max-w-lg max-w-sm">
            <div className="bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 border-0 rounded-lg shadow-lg relative flex flex-col w-full items-center justify-center outline-none">
              <div className="relative p-4 w-full text-center">
                {icon}
                <div className="flex flex-col w-full mb-4">
                  <div className="text-lg mb-2 font-bold">{title}</div>
                  {body}
                </div>
                <button
                  className={buttonClassName}
                  type="button"
                  onClick={props.hideModal}>
                  {buttonTitle}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </>

  )

}



