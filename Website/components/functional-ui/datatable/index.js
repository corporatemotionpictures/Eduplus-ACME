import React, { useEffect, useState } from 'react'
import { useTable, useSortBy, usePagination, useRowSelect } from 'react-table'
import { PageWithText, Pagination } from 'components/functional-ui/pagination'
import { FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiMove, FiPlay } from 'react-icons/fi'
import Sortable from 'sortablejs';
import toastr from 'toastr'
import { FiEdit, FiDelete, FiEye } from 'react-icons/fi'
import Tooltip from 'components/functional-ui/tooltips'
import { fetchAll, deleteData, updateAdditional, add, edit } from 'helpers/apiService';
import DeleteModel from 'components/functional-ui/modals/modal-confirmation'
import { FiX } from 'react-icons/fi'
import Switch from 'components/functional-ui/switch'
import moment from 'moment';
import Link from 'next/link';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <input
        type="checkbox"
        ref={resolvedRef}
        {...rest}
        className="form-checkbox h-4 w-4"
      />
    )
  }
)

var orderIndexes = []

const Datatable = ({ columns, data, paginationClick = null, pageSizedata = 10, pageIndexdata = 0,
  pageCountData = 10, sectionRow = true, randerEditModal = null, fetchList = null, sortable = true,
  baseTitle = null, modelTitle = null, queryTitle = null,
  editable = true, deletable = true, viewable = false, reorderable = true, status = true, approvable = true, pagination = true, pageUrl = null, modalView = false, modalBtnName = "Play" }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, selectedRowIds }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: pageIndexdata, pageSize: pageSizedata },
      manualPagination: true,
      pageCount: (Math.ceil(pageCountData / pageSizedata)),
      loading: true
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {

      let firstRow = {
        id: 'selection',
        // The header can use the table's getToggleAllRowsSelectedProps method
        // to render a checkbox
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <>
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          </>
        ),
        // The cell can use the individual row's getToggleRowSelectedProps method
        // to the render a checkbox
        Cell: ({ row }) => (
          <>
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          </>
        ),
        show: false
      };

      let statusRow = {
        id: 'status',
        Header: 'Status',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {(!('editable' in props.row.original) || props.row.original.editable == 1) && <Switch initialState={props.row.original.is_active == 1 ? true : false} color='green' offColor="red" id={props.row.original.id} onChange={changeStatus} />}
            </div>
          )
        },

      };

      let approveRow =
      {
        id: 'approvel',
        Header: "Approval",
        Cell: props => {
          var statusColor = 'bg-base text-white'

          if (props.row.original.approved == 1) {
            statusColor = 'bg-green-500 text-white'
          } else if (props.row.original.approved == -1) {
            statusColor = 'bg-red-500 text-white'
          }

          return (
            <>
              <select className={`${statusColor} text-white p-1 font-14 border-0 rounded`} onChange={(e) => changeApproveStatus(e, props.row.original.id)}>
                <option className="bg-green-500 text-white" selected={props.row.original.approved == 1 ? true : false} value="1" >Approved</option>
                <option className="bg-base text-white" selected={props.row.original.approved == 0 ? true : false} value="0" >Pending</option>
                <option className="bg-red-500 text-white" selected={props.row.original.approved == -1 ? true : false} value="-1" classname="bg-red">Rejected</option>
              </select>
            </>

          )
        },
        className: 'text-center',
        headerClassName: 'text-center'
      };

      let lastRow = {
        id: 'action',
        Header: 'Action',
        Cell: props => {
          return (
            <div className="flex lg:flex-row lg:flex-wrap space-y-0 space-x-1 w-20">
              {modalView == true && <a className="viewButton" title="View" onClick={() => randerEditModal(props.row.original)}>
                <span className=" bg-blue-100 text-white flex items-center justify-center rounded  px-2 py-1">
                  <p> <FiPlay size={16} className="stroke-current text-base font-display font-bold" /> </p>
                  <p className="text-base px-2">{modalBtnName}</p>
                </span>
              </a>}
              {viewable == true && <a className="viewButton mb-1 lg:pl-2" title="View">
                <span className="h-8 w-8 bg-blue-100 text-primary flex items-center justify-center rounded-full text-lg font-display font-bold">
                  <Tooltip placement='left' content="View Detail">
                    <Link href={`/dashboard/${pageUrl ? pageUrl : modelTitle}/[id]`} as={`/dashboard/${pageUrl ? pageUrl : modelTitle}/${props.row.original.id}`} className="">
                      <a target="_blank"><FiEye size={16} className="stroke-current text-base" /></a>
                    </Link>
                  </Tooltip>
                </span>
              </a>}
              {(editable == true && (!('editable' in props.row.original) || props.row.original.editable == 1)) && <a className="editButton pb-1 lg:pl-1" title="Edit" onClick={() => randerEditModal(props.row.original)}>
                <span className="h-8 w-8 bg-blue-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
                  <Tooltip placement='left' content="Edit Detail">
                    <FiEdit size={16} className="stroke-current text-base" />
                  </Tooltip>
                </span>
              </a>}
              {(deletable == true && (!('editable' in props.row.original) || props.row.original.editable == 1)) && <span className="lg:pl-1.5"
                onClick={() => { setId(props.row.original.id); setDeleteModel(true) }}
              >
                <a title="Delete">
                  <span className="h-8 w-8 bg-red-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
                    <Tooltip placement='left' content="Delete Row">
                      <FiDelete size={16} className="stroke-current text-red-500" />
                    </Tooltip>
                  </span>
                </a>
              </span>}
            </div>
          )
        },
      }


      let sort = {
        id: 'scroll',
        Header: '',
        Cell: props => {
          return (
            <div className="w-5 sorticon ml-2">
              <FiMove />
            </div>
          )
        },
      }


      columns.map((data, i) => {
        data.id = i
      })

      var coloumnData = []

      sectionRow == true && coloumnData.push(firstRow)
      coloumnData.push(...columns)
      status == true && coloumnData.push(statusRow)
      approvable == true && coloumnData.push(approveRow)
      let last = editable == true || deletable == true || viewable == true || modalView == true
      last == true && coloumnData.push(lastRow)
      sortable != false && coloumnData.push(sort)


      hooks.visibleColumns.push((columns) => [
        ...coloumnData
      ])

    }
  )

  const [selectedIds, setSelectedIds] = useState([])
  const [selected, setSelected] = useState([])
  const [id, setId] = useState(null)
  const [deleteModel, setDeleteModel] = useState(false)
  const [appliedOrderBox, setAppliedOrderBox] = useState(false)
  // const [orderIndexes, setOrderIndexes] = useState([])



  // Function for delete data
  const deleteRow = async () => {
    let deleteStatus = await deleteData(`${modelTitle}`, JSON.stringify({ id: id }))
    if (deleteStatus.success == true) {
      toastr.success(`${baseTitle} Deleted Successfully`)
      fetchList()
    }
    else {
      toastr.info(`You can't delete this ${baseTitle}. To delete this, you first need to delete the associated components with the this ${baseTitle}.`, 'Oops Sorry !',)
    }

    setDeleteModel(false)
  }


  const changeApproveStatus = async (e, id) => {
    let body = {
      label: queryTitle,
      id: id,
      approved: e.target.value,
      rejected_on: e.target.value == -1 ? moment().add(1, 'days').unix() : null,
    };

    var pyqPapers = await updateAdditional('approve', queryTitle, body)

    if (pyqPapers.success == true) {
      toastr.success(pyqPapers.message)
      fetchList();
    } else {
      toastr.error(pyqPapers.message)
    }
  };


  // Function for delete data
  const reorder = async (data) => {

    var update = await updateAdditional('re-indexing', queryTitle, data)

    if (update.success == true) {
      toastr.success('Re-Indexing Successfull')
    }
  }

  // Function for delete data
  const changeStatus = async (ids, status) => {

    var data = {
      id: ids,
      is_active: status,
    }

    var update = await updateAdditional('change-status', queryTitle, data)

    if (update.success == true) {
      toastr.success('Status change Successfull')
    }

    if (ids.length != undefined) {
      fetchList();
    }
  }

  useEffect(() => {

    let ids = []
    setSelectedIds(ids);

    data.map((item, index) => {
      if (Object.keys(selectedRowIds)
        .map((i) => parseInt(i, 10))
        .includes(index)) {
        ids.push(item.id)
        setSelectedIds(ids);
      }
    }
    )

    return () => {
      setSelectedIds(ids);
    }

  }, [selectedRowIds])

  useEffect(() => {
    return () => { applyDrops(Sortable, pageSize, pageIndex) }
  })



  function applyDrops(Sortable, pageSize, pageIndex) {

    if (!appliedOrderBox) {

      let logo = document.createElement('tbody');
      // assign and onload event handler
      window.addEventListener('load', (event) => {
      });

      if (document.getElementById('dataTableList') != undefined) {
        var tableList = document.getElementsByTagName('tbody')[0]
        document.getElementsByTagName("body")[0].setAttribute("id", "tableBody");

        setAppliedOrderBox(true)

        Sortable.create(dataTableList, {
          group: "sorting",
          sort: true,
          handle: ".sorticon",
          store: {
            set: function (sortable) {
              var finalList = []
              var order = sortable.toArray();
              order = order.map((value, key) => {
                finalList.push({ id: value, position: (pageSize * pageIndex) + key });
              })

              orderIndexes = finalList;

              document.getElementById('reOrderBtn').style.display = 'block'
            },
          },
        });
      }
    }

  }






  // Render the UI for your table
  return (
    <>

      {deleteModel && <DeleteModel
        title="Delete"
        icon={
          <span className="h-10 w-10 bg-red-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
            <FiX size={18} className="stroke-current text-red-500" />
          </span>
        }
        body={
          <div className="text-sm text-gray-500">
            Are you sure you want to delete ?
          </div>
        }
        buttonTitle="Delete"
        buttonClassName="btn btn-default btn-rounded bg-red-500 hover:bg-red-600 text-white"
        useModel={deleteModel}
        hideModal={() => setDeleteModel(false)}
        onClick={deleteRow}
      />
      }


      {
        selectedIds.length > 0 &&
        <>

          <button className="  btn btn-default bg-green-500 text-white hover:text-blue-700 border-blue-500 hover:border-blue-700 sm:float-right mr-2 lg:ml-2 lg:my-2" onClick={() => changeStatus(selectedIds, 1)}>
            Activate Selected
          </button>
        </>
      }
      {
        selectedIds.length > 0 &&
        <button className="  btn btn-default bg-red-500 text-white hover:text-blue-700 border-blue-500 hover:border-blue-700 sm:float-right lg:ml-2 lg:my-2" onClick={() => changeStatus(selectedIds, 0)}>
          Deactivate Selected
        </button>
      }
      <button id="reOrderBtn" className="  btn btn-default btn-outlined bg-blue-500 text-white hover:text-blue-700 border-blue-500 hover:border-blue-700 float-right ml-2 my-2" style={{ display: 'none' }} onClick={() => reorder(orderIndexes)}>
        Apply Order
      </button>
      <div className="overflow-x-scroll w-full border-t pt-2" onClick={() => applyDrops(Sortable, pageSize, pageIndex)} >
        <table {...getTableProps()} className="table w-full" >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    <div className="flex flex-row items-center justify-start">
                      <span>{column.render('Header')}</span>
                      {/* Add a sort direction indicator */}
                      <span className="ml-auto">
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <FiChevronDown className="stroke-current text-2xs" />
                          ) : (
                            <FiChevronUp className="stroke-current text-2xs" />
                          )
                        ) : (
                          ''
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} id="dataTableList">

            {page.map((row, i) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()} data-id={row.original.id} >
                  {row.cells.map((cell) => {
                    return <td {...cell.getCellProps()} style={{ whiteSpace: 'normal' }}>{cell.render('Cell')}</td>
                  })}
                </tr>
              )
            })}
          </tbody>


        </table>
      </div>

      {
        page.length <= 0 && <div className="text-center lg:mb-10 mb-4 mt-20">
          <img className="w-1/4 lg:w-1/5 mx-auto block" src="/images/search.png"></img>
          <h5 className="font-bold">No Data Available</h5>
          <p className="text-gray-400 mt-1">There is no data available in the table.</p>
        </div>
      }

      {
        pagination != false && page.length > 0 &&
        <div className={`flex flex-col md:flex-row items-center justify-between my-4 ${baseTitle}`}>
          <div className="flex flex-wrap items-center justify-start space-x-2 pagination">
            <Pagination
              onClick={paginationClick}
              items={pageOptions.slice(pageIndex - 1, pageIndex + 3)}
              // items={Array.from(Array().keys())}
              active={parseInt(pageIndex) + 1}
              icons={true}
              previous={null}
              next={null}
              pageSize={pageSize}
              pageIndex={pageIndex}
              canPreviousPage={parseInt(pageIndex) == 0 ? false : true}
              canNextPage={canNextPage}
              pageCount={pageCount}
              gotoPage={gotoPage}
              previousPage={previousPage}
              nextPage={nextPage}
            />

          </div>

          <span>
            Page{' '}
            <b>
              {parseInt(pageIndex) + 1} of {pageOptions.length}
            </b>{' '}
          </span>

          <select
            className="form-select text-sm bg-white dark:bg-gray-800 dark:border-gray-800 outline-none shadow-none focus:shadow-none mt-2 md:mt-0"
            value={pageSize}
            onChange={(e) => {
              paginationClick(0, Number(e.target.value))
              // applyDrops(Sortable, pageSize, pageIndex)
            }}>
            {[10, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>

      }
      {/* <pre>
        {JSON.stringify(
          data.filter((item, index) =>
            Object.keys(selectedRowIds)
              .map((i) => parseInt(i, 10))
              .includes(index)
          ),
          null,
          2
        )}
      </pre> */}


    </>
  )
}



export default Datatable
