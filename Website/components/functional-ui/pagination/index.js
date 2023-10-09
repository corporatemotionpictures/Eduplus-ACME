import PropTypes from 'prop-types'
import { FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export const PageWithText = ({
  activeClassNames = 'btn btn-default bg-base hover:bg-blue-600 text-white',
  inactiveClassNames = 'btn btn-default bg-transparent hover:bg-gray-200 text-gray-900 dark:text-white',
  children,
  active = false,
  onClick
}) => {
  if (active) {
    return (
      <button onClick={onClick} className={activeClassNames}>
        {children}
      </button>
    )
  }
  return (
    <button onClick={onClick} className={inactiveClassNames}>
      {children}
    </button>
  )
}

export const Page = ({
  activeClassNames = 'btn btn-circle bg-base hover:bg-blue-600 text-white mb-1',
  inactiveClassNames = 'btn btn-circle bg-transparent hover:bg-gray-200 text-gray-900 dark:text-white',
  children,
  active = false,
  onClick
}) => {
  if (active) {
    return (
      <button onClick={onClick} className={activeClassNames}>
        {children}
      </button>
    )
  }
  return (
    <button onClick={onClick} className={inactiveClassNames}>
      {children}
    </button>
  )
}

export const Pages = ({ items, active, onClick, pageSize, gotoPage }) => (
  <>
    {items.map(i => (
      <Page onClick={() => { gotoPage(i); onClick(String(((pageSize * i))), pageSize) }} active={i + 1 === active ? true : false} key={i}>
        {i + 1}
      </Page>
    ))}
  </>
)

Pages.propTypes = {
  items: PropTypes.array.isRequired,
  active: PropTypes.number.isRequired
}

export const Pagination = ({
  items,
  active,
  previous = null,
  next = null,
  icons = false,
  pageSize = 10,
  onClick,
  pageIndex,
  canPreviousPage,
  canNextPage,
  pageCount,
  gotoPage,
  previousPage,
  nextPage
}) => {
  if (icons) {
    return (
      <div className="flex flex-wrap items-center justify-start space-x-2 pagination">
        {canPreviousPage && (
          <PageWithText onClick={() => { gotoPage(0); onClick("0", pageSize); }}>First</PageWithText>
        )}
        {canPreviousPage && (
          <PageWithText onClick={() => { previousPage(); onClick(String(((pageIndex - 1) * pageSize)), pageSize); }}><FiChevronLeft size={16} className="stroke-current" /></PageWithText>
        )}
        <Pages onClick={onClick} items={items} active={active} pageSize={pageSize} gotoPage={gotoPage} />
        {canNextPage && (
          <PageWithText onClick={() => { nextPage(); onClick(((pageIndex + 1) * pageSize), pageSize); }} disabled={!canNextPage}>
            <FiChevronRight size={16} className="" />
          </PageWithText>
        )}
        {canNextPage && (
          <PageWithText
            onClick={() => { gotoPage(pageCount - 1); onClick(((pageCount - 1) * pageSize), pageSize); }}
            disabled={!canNextPage}>
            Last
          </PageWithText>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center justify-start space-x-2 pagination">
      {previous && <PageWithText onClick={onClick}>{previous}</PageWithText>}
      <Pages onClick={onClick} items={items} active={active} pageSize={pageSize} />
      {next && <PageWithText onClick={onClick}>{next}</PageWithText>}
    </div>
  )
}

Pagination.propTypes = {
  items: PropTypes.array.isRequired,
  active: PropTypes.number.isRequired,
  previous: PropTypes.any.isRequired,
  next: PropTypes.any.isRequired,
  icons: PropTypes.bool
}
