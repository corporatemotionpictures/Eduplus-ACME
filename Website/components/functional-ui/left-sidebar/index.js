import React from 'react'
import Title from './title'
import Item from './item'
import Logo from './logo'
import { fetchAll } from 'helpers/apiService';
import { Component } from 'react';
import { FiSearch } from 'react-icons/fi';
import { IoSearchCircle } from 'react-icons/io5';
import Filter from 'components/classical-ui/filters'
import LeftSidebarShimmer from 'components/website/shimmer/leftsidebar-simmer'


export default class extends Component {

  state = {
    navigations: [],
    filters: {
      byType: true
    },
  }

  fetchData = async () => {

    var modules = await fetchAll('modules', this.state.filters)

    if (modules.modules && modules.modules.length > 0 && modules.modules[0].items) {
      modules.modules[0].items.push({
        icon: "FiHelpCircle",
        is_active: 1,
        items: [],
        parent_id: null,
        title: "Help",
        type: "Tutorials",
        url: "/dashboard/tutorials",
        newdata: true,
      })
    }

    this.setState({
      navigations: modules.modules,
      searched: modules.searched
    })

  }

  // Search data
  onFilter = async (filterData) => {
    var filters = this.state.filters;
    this.setState({ fetching: true })
    var data;
    this.setState({
      filters: {
        ...filters,
        ...filterData
      }
    }, async () => {
      this.fetchData();
    })

  }

  componentDidMount() {

    this.fetchData()
  }

  render() {

    const filterObjects = [
      {
        type: 'blank',
        content: <div className="w-1/6 sm:w-1/6 mb-0 mt-1 md:mt-1 pl-2">
          <IoSearchCircle size="28" className='text-blue-500' />
        </div>
      },
      
      {
        name: 'search',
        type: 'text',
        effectedRows: [],
        className: " w-5/6 sm:w-5/6 mb-0",
        InputclassName: " border-0 px-0 focus:ring-transparent ring-transparent",
        placeholder: 'Search Module'
      }
    ]


    return (

      <div className="left-sidebar left-sidebar-1 h-screen " id="left-sidebar-1" onClick={async (e) => {

        var width = $('#left-sidebar-1').width();
        var parentWidth = $('#left-sidebar-1').offsetParent().width();
        var percent = Math.round(100 * width / parentWidth);

        if (e.target != document.getElementById('left-sidebar-child') && (!document.getElementById('left-sidebar-child').contains(e.target) || ((e.target.parentElement['className'] == 'l1' || e.target.parentElement['className'] == 'l0') && percent == 100))) {
          await window.localStorage.setItem('collapsed', !window.localStorage.getItem('collapsed'))
          window.dispatchEvent(new Event('storage'))
        }
      }
      }>

        <div className="left-sidebar-child h-screen overflow-scroll" id="left-sidebar-child">
          <Logo />

          <div className="  mx-3">
            {(screen.width <= 767 || !window.localStorage.getItem('collapsed') || window.localStorage.getItem('collapsed') == 'false') &&
              <Filter filterObjects={filterObjects} filterOnChange={true} hideBtn={true} onFilter={this.onFilter} forRow={true} />}
            <hr />
          </div>
          {this.state.navigations && this.state.navigations.map((menu, i) => (
            <React.Fragment key={i}>
              {/* <Title>{menu.title}</Title> */}
              <ul className="mt-2">
                {menu.items.map((l0, a) => (
                  <>
                    {l0 && <li key={a} className="l0">
                      <Item {...l0} icon={l0.icon} hiddenData={this.state.searched ? false : true} />
                      <ul>
                        {l0.items != undefined && l0.items && l0.items.map((l1, b) => (
                          <li key={b} className="l1">
                            <Item {...l1} icon={l1.icon} />
                            <ul>
                              {l1.items != undefined && l1.items && l1.items.map((l2, c) => (
                                <li key={c} className="l2">
                                  <Item {...l2} icon={l2.icon} />
                                  <ul>
                                    {l2.items != undefined && l2.items && l2.items.map((l3, d) => (
                                      <li key={d} className="l3">
                                        <Item {...l3} icon={l3.icon} />
                                        <ul>
                                          {l3.items != undefined && l3.items && l3.items.map((l4, e) => (
                                            <li key={e} className="l4">
                                              <Item {...l4} icon={l4.icon} />
                                            </li>
                                          ))}
                                        </ul>
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </li>}
                  </>
                ))}

              </ul>
            </React.Fragment>
          ))}
          {
            (!this.state.navigations || this.state.navigations.length <= 0) && <LeftSidebarShimmer />
          }
        </div>
      </div>
    )

  }
}

