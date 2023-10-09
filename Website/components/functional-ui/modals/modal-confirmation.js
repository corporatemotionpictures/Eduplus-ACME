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
            className="relative w-auto lg:my-4 mx-auto lg:max-w-lg max-w-xs">
            <div className="bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 border-0 rounded-lg shadow-lg relative flex flex-col w-full outline-none">
              <div className="relative p-4 flex-auto">
                <div className="flex items-start justify-start p-2 space-x-4">
                  <div className="flex-shrink-0 w-12">{icon}</div>
                  <div className="flex flex-col w-full">
                    <div className="text-lg mb-2 font-bold">{title}</div>
                    {body}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end p-4 border-t border-gray-200 dark:border-gray-700 border-solid rounded-b space-x-2">
                <button
                  className="btn btn-default btn-rounded bg-white hover:bg-gray-100 text-gray-900"
                  type="button"
                  onClick={props.hideModal}>
                  Cancel
                  </button>
                <button
                  className={buttonClassName}
                  type="button"
                  onClick={props.onClick}>
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



