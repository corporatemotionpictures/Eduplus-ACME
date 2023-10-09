import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useEffect } from 'react'

export const VerticalTabs = ({ tabs }) => {
  const [openTab, setOpenTab] = useState(0)
  return (
    <div className="flex flex-row items-start justify-start tabs">
      <div className="flex-shrink-0 border-r">
        <div className="flex flex-wrap flex-col space-y-2">
          {tabs.map((tab, key) => (
            <button
              key={key}
              onClick={() => {
                setOpenTab(tab.index)
              }}
              className={`tab tab-pill items-setting ${openTab === tab.index ? 'tab-active' : 'border-b'
                }`}
              type="button" style={{ width: '14rem' }}>
              {tab.title}
            </button>
          ))}
        </div>
      </div>
      <div className="ml-0 w-full">
        {tabs.map((tab, key) => (
          <div
            className={`tab-content ${openTab !== tab.index ? 'hidden' : 'block'
              }`}>
            {openTab == tab.index && tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}

VerticalTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.number,
      content: PropTypes.element,
      title: PropTypes.any
    })
  ).isRequired
}

export const Pills = ({ tabs }) => {
  const [openTab, setOpenTab] = useState(0)
  return (
    <div className="flex flex-wrap flex-col w-full tabs">
      <div className="flex lg:flex-wrap flex-row lg:space-x-2 nav nav-pills nav-justified">
        {tabs.map((tab, key) => (
          <div key={key} className="flex-none nav-item w-100">
            <button
              onClick={() => {
                setOpenTab(tab.index)
              }}
              className={`tab tab-pill nav-link w-100 font-14 ${openTab === tab.index ? 'tab-active active ' : ''
                }`}
              type="button">
              {tab.title}
            </button>
          </div>
        ))}
      </div>

      <hr />
      {tabs.map((tab, key) => (
        <div
          className={`tab-content ${openTab !== tab.index ? 'hidden' : 'block'
            }`}>
          {openTab == tab.index && tab.content}
        </div>
      ))}
    </div>
  )
}

Pills.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.number,
      content: PropTypes.element,
      title: PropTypes.any
    })
  ).isRequired
}

export const IconTabs = ({ tabs }) => {
  const [openTab, setOpenTab] = useState(0)
  return (
    <div className="flex flex-wrap flex-col w-full tabs">
      <div className="flex lg:flex-wrap flex-row lg:space-x-2">
        {tabs.map((tab, key) => (
          <div key={key} className="flex-none">
            <button
              onClick={() => {
                setOpenTab(tab.index)
              }}
              className={`tab rounded-lg flex flex-row items-center justify-around ${openTab === tab.index ? 'tab-active' : ''
                }`}
              type="button">
              {tab.title}
            </button>
          </div>
        ))}
      </div>
      {tabs.map((tab, key) => (
        <div
          className={`tab-content ${openTab !== tab.index ? 'hidden' : 'block'
            }`}>
          {openTab == tab.index && tab.content}
        </div>
      ))}
    </div>
  )
}

IconTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.number,
      content: PropTypes.element,
      title: PropTypes.any
    })
  ).isRequired
}

export const UnderlinedTabs = ({ tabs, activeTab = 0, classTab =null }) => {
  const [openTab, setOpenTab] = useState(activeTab)

  useEffect(() => {
    setOpenTab(activeTab)
    return
  }, [activeTab])

  return (
    <div className="flex flex-wrap flex-col w-full tabs courses_tab_wrapper ">
      <div className="flex flex-wrap flex-col w-full tabs  overflow-scroll ">
        <div className={`flex lg:flex-wrap flex-row lg:space-x-2 nav nav-tabs ${classTab ? classTab : ''}`}>
          {tabs.map((tab, key) => (
            <div key={key} className="flex-none nav-item">
              <button
                onClick={() => {
                  setOpenTab(tab.index)

                  if( tab.onClick){
                    tab.onClick()
                  }
                }}
                className={
                  openTab === tab.index
                    ? 'tab tab-underline tab-active nav-link active'
                    : 'tab tab-underline nav-link font-hellix'
                }
                type="button">
                {tab.title}
              </button>
            </div>
          ))}
        </div>
      </div>
      {tabs.map((tab, key) => (
        <div
          key={key}
          className={`tab-content px-0 ${openTab !== tab.index ? 'hidden' : 'block'
            }`}>
          {openTab == tab.index && tab.content}
        </div>
      ))}
    </div>
  )
}

UnderlinedTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.any,
      content: PropTypes.element,
      title: PropTypes.any
    })
  ).isRequired
}

export const DefaultTabs = ({ tabs }) => {
  const [openTab, setOpenTab] = useState(0)
  return (
    <div className="flex flex-wrap flex-col w-full tabs">
      <div className="flex lg:flex-wrap flex-row lg:space-x-2">
        {tabs.map((tab, key) => (
          <div key={key} className="flex-none">
            <button
              onClick={() => {
                setOpenTab(tab.index)
              }}
              className={`tab ${openTab === tab.index ? 'tab-active' : ''}`}
              type="button">
              {tab.title}
            </button>
          </div>
        ))}
      </div>
      {tabs.map((tab, key) => (
        <div
          className={`tab-content ${openTab !== tab.index ? 'hidden' : 'block'
            }`}>
          {openTab == tab.index && tab.content}
        </div>
      ))}
    </div>
  )
}

DefaultTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.number,
      content: PropTypes.element,
      title: PropTypes.any
    })
  ).isRequired
}
