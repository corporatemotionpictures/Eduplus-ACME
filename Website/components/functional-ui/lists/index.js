import {FaBox} from 'react-icons/fa'
import {CircularBadge} from 'components/functional-ui/badges'
import define from 'src/json/worddefination.json'

export const singleLine = ({items}) => (
  <div className="w-full mb-4">
    {items.map((item, i) => (
      <div
        className="flex items-center justify-start p-2 space-x-4"
        key={i}>
        <div className="flex flex-col w-full">
          <div className="text-sm">{item.title}</div>
        </div>
        <div className="flex-shrink-0">
          <CircularBadge size="sm" color="bg-indigo-500 text-white">
            1
          </CircularBadge>
        </div>
      </div>
    ))}
  </div>
)

export const singleWithImage = ({items}) => (
  <div className="w-full mb-4">
    {items.map((item, i) => (
      <div
        className="flex items-center justify-start p-2 space-x-4"
        key={i}>
        <div className="flex-shrink-0 w-8">
          <img
            src={item.img}
            alt={window.localStorage.getItem('defaultImageAlt')}
            className="h-8 w-full shadow-lg rounded-full ring"
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="text-sm">{item.title}</div>
        </div>
        <div className="flex-shrink-0">
          <CircularBadge size="sm" color="bg-indigo-500 text-white">
            1
          </CircularBadge>
        </div>
      </div>
    ))}
  </div>
)

export const DoubleWithImage = ({items}) => (
  <div className="w-full mb-4">
    {items.map((item, i) => (
      <div
        className="flex items-center justify-start p-2 space-x-4"
        key={i}>
        <div className="flex-shrink-0 w-8">
          <img
            src={item.img}
            alt={window.localStorage.getItem('defaultImageAlt')}
            className={`h-8 w-full shadow-lg rounded-full ring`}
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="text-sm font-bold">{item.title}</div>
          <div className="text-sm">{item.sentence}</div>
        </div>
        <div className="flex-shrink-0">
          <CircularBadge size="sm" color="bg-indigo-500 text-white">
            1
          </CircularBadge>
        </div>
      </div>
    ))}
  </div>
)

export const DoubleLine = ({items}) => (
  <div className="w-full mb-4">
    {items.map((item, i) => (
      <div
        className="flex items-start justify-start p-2 space-x-4"
        key={i}>
        <div className="flex-shrink-0 w-8">
          <span className="h-8 w-8 bg-teal-500 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
            AB
          </span>
        </div>
        <div className="flex flex-col w-full">
          <div className="text-sm font-bold">{item.title}</div>
          <div className="text-sm">{item.sentence}</div>
        </div>
        <div className="flex-shrink-0">
          <span className="text-xs text-gray-500">2 days ago</span>
        </div>
      </div>
    ))}
  </div>
)


const multiLine = ({items}) => (
  <div className="w-full mb-4">
    {items.map((item, i) => (
      <div
        className="flex items-center justify-start p-2 space-x-4"
        key={i}>
        <div className="flex-shrink-0 w-8">
          <img
            src={item.img}
            alt={window.localStorage.getItem('defaultImageAlt')}
            className={`h-8 w-full shadow-lg rounded-full ring`}
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="text-sm font-bold">{item.title}</div>
          <div className="text-sm text-gray-500">{item.description}</div>
          <div className="flex flex-row items-center justify-start">
            <FaBox size={16} className="stroke-current text-gray-300" />
            <div className="text-gray-300 ml-2">{item.timeago}</div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <CircularBadge size="sm" color="bg-indigo-500 text-white">
            1
          </CircularBadge>
        </div>
      </div>
    ))}
  </div>
)

export default multiLine
