import PropTypes from 'prop-types'
import Validation from 'components/functional-ui/forms/validation'
import StoreModel from 'components/functional-ui/modals/modal-store'


const SectionTitle = ({ title, subtitle, right = null, onClick, hideButton = null, html = null, className=null }) => {

 let parseHtml = (html) => {
    return html
  }
  return (
    <div className={className ? className : 'section-title w-full mb-6 pt-3'}>
      <div className="flex flex-row items-center justify-between mb-4">
        <div className="flex flex-col">
          <div className="text-xs uppercase font-regular text-gray-500 dark:text-white">{title}</div>
          <div className="text-xl font-bold capitalize">{subtitle}</div>
        </div>
        {right}

        {(!hideButton || hideButton == false) &&
          <button
            className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white"
            type="button"
            onClick={onClick}>
            <i class="fas fa-plus mr-1"></i> Add New
        </button>
        }

        {parseHtml(html)}
      </div>
    </div>
  )
}

SectionTitle.propTypes = {
  title: PropTypes.any,
  subtitle: PropTypes.any,
  right: PropTypes.any
}
export default SectionTitle
