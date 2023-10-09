import {
  FiClock,
} from 'react-icons/fi'
import Input from 'components/functional-ui/social-feed/input'
import Comments from 'components/functional-ui/social-feed/comments'
import Icons from 'components/functional-ui/social-feed/icons'
import define from 'src/json/worddefination.json'

const Posts = ({items, comments}) => (
  <div className="w-full">
    {items.map((item, i) => (
      <div className="flex flex-col px-4" key={i}>
        <div
          className="flex flex-row items-start justify-start mb-2"
          >
          <div className="flex-shrink-0 w-8 mt-1 mr-4">
            <img
              src={item.img}
              alt={window.localStorage.getItem('defaultImageAlt')}
              className={`h-8 w-full shadow-lg rounded-full ring`}
            />
          </div>
          <div className="flex flex-grow flex-col w-full">
            <div className="text-sm font-bold">{item.title}</div>
            <div className="flex flex-row items-center justify-start mb-2">
              <FiClock size={18} className="stroke-current text-gray-500" />
              <div className="text-gray-500 ml-1">{item.timeago}</div>
            </div>
          </div>
        </div>
        <div className="w-full mb-4">{item.sentences}</div>
        <div className="w-full mb-4">
          <img
            src={item.largeImage}
            alt={window.localStorage.getItem('defaultImageAlt')}
            className="object-cover h-48 w-full"
          />
        </div>

        <Icons items={items} />
        <Input item={item} />
        <Comments items={comments} />
      </div>
    ))}
  </div>
)

export default Posts
