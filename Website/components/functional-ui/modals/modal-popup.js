import Portal from 'components/functional-ui/portal'
import React, { useState, useEffect, useRef } from 'react'
import { FiX } from 'react-icons/fi'
import palettes from 'helpers/redux/reducers/palettes'
import Link from 'next/link'

export default function (props) {

  const background = palettes()

  const { image, link, state, video, html, noWidthLimit } = props

  const modalRef = useRef(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    return setOpen(true)
  }, [image])


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!modalRef || !modalRef.current) return false
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

  function randerhtml(html) {
    return html
  }

  return (
    <>
      {open && (
        <Portal selector="#portal">
          <div className="modal-backdrop fade-in" ></div>
          <div
            className={`modal show ${background === 'dark' ? 'dark' : ''}`}
            data-background={background} >
            <div
              className={`relative w-auto lg:my-4 mx-auto ${!video && !noWidthLimit ? 'lg:max-w-lg max-w-sm' : ''}`} ref={modalRef}>
              <div className="bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 border-0 rounded-lg shadow-lg relative flex flex-col w-full items-center justify-center outline-none">
                <div className="relative w-full text-center">
                  {image && <Link href={link ? link : ''} >
                    <a target="_blank"><img src={image} /></a>
                  </Link>}
                  {video && video}
                  {html && randerhtml(html)}
                </div>
              </div>
            </div>
          </div>
        </Portal>)}
    </>

  )

}



