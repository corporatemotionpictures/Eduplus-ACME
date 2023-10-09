import Portal from 'components/functional-ui/portal'
import palettes from 'helpers/redux/reducers/palettes'
import { ProgressBar, ProgressBarWithText } from 'components/functional-ui/progress-bars'

export default function (props) {

  const background = palettes()

  const { title, color, defaultValue } = props

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
                <div className="flex flex-col w-full mb-4">
                  <div className="text-lg mb-2 font-bold">{title}</div>
                  <div className="mb-4" key={color}>
                    <ProgressBar width={defaultValue} color={color} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </Portal>
    </>

  )

}



