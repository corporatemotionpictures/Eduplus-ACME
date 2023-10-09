import React, {useState, useEffect, useRef} from 'react'
import Portal from 'components/functional-ui/portal'
import {FiX} from 'react-icons/fi'
import palettes from 'helpers/redux/reducers/palettes'

const Modal = ({buttonTitle= 'Open Modal', title, body}) => {
  let {background} = palettes()

  const modalRef = useRef(null)
  const [open, setOpen] = useState(false)
  const show = () => {
    setOpen(true)
  }
  const hide = () => {
    setOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!modalRef || !modalRef.current) return false
      console.log (modalRef.current.contains(event.target)) 
      if (!open || modalRef.current.contains(event.target)) {
        return false
      }
      setOpen(!open)
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, modalRef])

  return (
    <>
      <button
        className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white"
        type="button"
        onClick={show}>
        {buttonTitle}
      </button>
      {open && (
        <Portal selector="#portal">
          <div className="modal-backdrop fade-in"></div>
          <div className={`modal show ${background === 'dark' ? 'dark' : ''}`} data-background={background}>
            <div className="relative min-w-sm w-auto mx-auto lg:max-w-5xl" ref={modalRef}>
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <button
                    className="modal-close btn btn-transparent"
                    onClick={hide}>
                    <FiX size={18} className="stroke-current" />
                  </button>
                </div>
                <div className="relative p-4 flex-auto">{body}</div>
                <div className="modal-footer space-x-2">
                  <button
                    className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white"
                    type="button"
                    onClick={hide}>
                    Close
                  </button>
                  <button
                    className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white"
                    type="button"
                    onClick={hide}>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

export default Modal
