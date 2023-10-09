import Portal from 'components/functional-ui/portal'
import { FiX } from 'react-icons/fi'
import palettes from 'helpers/redux/reducers/palettes'

export default function (props) {

  const background = palettes()

  const { title, body } = props
  

  return (
    <>

      <Portal selector="#portal">
        <div className="modal-backdrop fade-in"></div>
        <div className={`modal show ${background === 'dark' ? 'dark' : ''}`} data-background={background.background}>
          <div className={`relative min-w-sm w-full  mx-auto lg:max-w-5xl  px-4 md:px-0 md:w-auto ${props.className ? props.className : ''}`}>
            <div className="modal-content" style={{ maxHeight: '90vh' }}>
              <div className="modal-header">
                <h3 className="text-xl font-semibold capitalize" >{title}</h3>
                <button
                  className="modal-close btn btn-transparent"
                  onClick={props.hideModal}>
                  <FiX size={18} className="stroke-current" />
                </button>
              </div>
              <div className="relative p-4 flex-auto" style={{ overflowY: 'scroll' }}>
                {body}
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </>

  )

}



