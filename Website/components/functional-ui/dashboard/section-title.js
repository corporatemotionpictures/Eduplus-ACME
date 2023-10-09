import {FiPlus} from 'react-icons/fi'

const SectionTitle = ({title, subtitle, model, right = null}) => {
  return (
    <div className="w-full mb-6 pt-3">
      <div className="flex flex-row items-center justify-between mb-4">
        <div className="flex flex-col">
          <div className="text-xs uppercase font-regular text-gray-500  dark:text-white">
            {title}
          </div>
          <div className="text-xl font-bold capitalize">{subtitle}</div>
        </div>
        <div className="flex-shrink-0 space-x-2">
          <button className="btn btn-default btn-rounded btn-icon bg-base hover:bg-blue-600 text-white space-x-1">
            <FiPlus className="stroke-current text-white" size={16} />
            <span>Add widget</span>
          </button>
        </div>
      </div>

      
    </div>
  )
}

export default SectionTitle
