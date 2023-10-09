import { Component } from 'react';
import { fetchByID, fetchAll, add, send } from 'helpers/apiService';
import { getUser, getToken } from 'helpers/auth';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Widget from 'components/functional-ui/widget'
import Comments from 'components/functional-ui/social-feed/comments'
import { Badge } from 'components/functional-ui/badges'
import define from 'src/json/worddefination.json'
import ScrollableFeed from 'react-scrollable-feed'
import Link from 'next/link'
import { FiBox, FiMenu } from 'react-icons/fi'
import ChatTicket from "pages/socket/tickets";
import {
  FiCamera,
  FiPaperclip,
  FiMic,
} from 'react-icons/fi'
import {
  FiThumbsUp,
  FiMessageCircle,
  FiShare2
} from 'react-icons/fi'
import moment from 'moment'

//

export default class extends Component {
  state = {
    post: {},
    search: '',
    fetching: true,
    modelTitle: 'raise-tickets',
    name: '',
    mobile_number: '',
    city: '',
    token: null,
    image: '',
    isUser: false,
    raiseTickets: [],
    raiseTicket: [],
    ticket: {},
    status: '',
    values: [],
    currentId: null,
    user: null,
    collapsed: false
  }

  // 
  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchData = async (id) => {

    let user = await getUser();
    this.setState({
      user: user,
      token: getToken(),
    })
    let data = await fetchAll("raise-tickets");
    this.setState(data)

    this.setState({ currentId: data.raiseTickets && data.raiseTickets.length > 0 ? data.raiseTickets[0].id : null });


    if (data.raiseTickets.length > 0) {
      this.fetchTicket(this.state.currentId, true);
    }


  }

  // fetch all comments
  fetchTicket = async (id, first = false) => {

    this.setState({
      currentId: id
    });

    var data = await fetchByID(this.state.modelTitle, id, { dateWise: true, noLog: true });
    this.setState(data)

    if (!first) {

      this.setState({
        collapsed: true
      })
    }

  }

  comment = async (event) => {
    event.preventDefault()
    var f = document.getElementById('form')
    var form = new FormData(document.getElementById('form'));
    var inputValue = form.get("ticket");
    let body = {
      ticket_id: this.state.currentId,
      message: inputValue,
      name: this.state.ticket.name,
      mobile_number: this.state.ticket.mobile_number,
      city: this.state.ticket.city,
      ticket_type: 'RESPONSE',
      // user_image: this.state.ticket.user_image,
    }
    var comme = await add('raise-tickets', body)
    if (comme.updated) {
      this.fetchTicket(this.state.currentId)
    }
    if (f) {
      f.reset()
    }
  }

  // 
  componentDidMount() {
    this.fetchData();
  }


  close = async (event) => {
    event.preventDefault()
    var f = document.getElementById('form')
    let body = {
      id: this.state.currentId,
      status: 'CLOSED'
    }
    var comme = await send('raise-tickets/close-ticket', body)
    if (comme.updated) {
      this.fetchTicket(this.state.currentId)
      toastr.success('Closed Successfully')
    }
    if (f) {
      f.reset()
    }
  }


  setCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed
    })

  }

  // 
  render() {
    const post = this.state.post

    return (
      <>
        {
          this.state.post &&
          <>
            <SectionTitle title="Ticket" subtitle="Raise Tickets" hideButton={true} />

            <div
              title=""
              className='widget w-full rounded-lg bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 h-90'>
              {this.state.raiseTickets && this.state.raiseTickets.length > 0 && <div className="flex flex-row justify-start border-b h-full">
                <div className={`md:w-1/4 md:border-r-4 ${this.state.collapsed == false ? 'w-full' : 'hidden md:block'}`}>

                  <div className="w-full h-full">
                    <div className="border-b topBar border-rad2">
                      <div className="flex justify-between w-full">

                        <div className="flex">
                          <div>
                            <h5 className="text-black capitalize">Tickets</h5>
                            <h5 className="text-sm font-bold capitalize">List</h5>

                          </div>

                        </div>
                        <div className="flex flex-wrap justify-center items-center md:hidden" onClick={() => this.setCollapsed()}>
                          <FiMenu size={20} />
                        </div>
                      </div>
                    </div>

                    {/* <div className="mb-2 uppercase font-bold text-xs tracking-wider flex flex-row items-center justify-center w-full uppercase  pl-4">Tickets</div> */}
                    <div className="w-full overflow-auto h-4/5">
                      {this.state.raiseTickets && this.state.raiseTickets.map((ticket, i) => (
                        <div
                          className={`flex items-center justify-start p-2 space-x-4 border-b ${this.state.currentId == ticket.id ? 'bg-chat-selected' : ''}`}
                          key={i} onClick={() => this.fetchTicket(ticket.id)}>

                          <div className="flex flex-col w-full">
                            <div className="text-sm  flex justify-between">
                              <span className="font-bold capitalize"> {ticket.name}</span>
                              <span className={` text-xs text-gray-500 ${this.state.currentId == ticket.id ? 'text-white' : ''}`}>{moment(ticket.created_at).fromNow()}</span>
                            </div>
                            <div className={`text-sm font-bold text-gray-500 truncate  ${this.state.currentId == ticket.id ? '' : ''}`}>{ticket.query}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`md:w-3/4 ${this.state.collapsed == true ? 'w-full' : 'hidden md:block'}`}>
                  {this.state.ticket && <div className="border-b topBar border-rad ">
                    <div className="flex justify-between w-full">

                      <div className="flex items-center">
                        <div className="flex flex-wrap justify-center items-center pr-2 md:hidden" onClick={() => this.setCollapsed()}>
                          <FiMenu size={20} />
                        </div>
                        {
                          this.state.ticket.user_image && this.state.ticket.user_image === "/images/default-profile.jpg" &&
                          <div className="profile_image profile_image-0 w-8 h-8 md:w-12 md:h-12 text-sm lg:text-lg mr-2 flex items-center justify-center font-bold uppercase">
                            {`${this.state.ticket.name.split(' ').slice(0, -1).join(' ').charAt(0)}${this.state.ticket.name.split(' ').slice(-1).join(' ').charAt(0)}`}
                          </div>
                          ||
                          <div className="flex-shrink-0 w-8 md:w-12 mr-2"><img
                            ref={input => this.prev = input}
                            src={this.state.ticket.user_image}
                            className="h-8 md:h-12 w-full shadow-lg rounded-full ring"
                          /></div>

                        }
                        <div>
                          <h5 className="text-base md:text-lg text-black capitalize">{`${this.state.ticket.name}`}</h5>
                          <h5 className="text-sm font-bold capitalize">{`${this.state.ticket.mobile_number}`}</h5>
                        </div>

                      </div>
                      <div className="flex flex-wrap justify-center items-center md:pr-5">

                        {this.state.ticket.status != 'CLOSED' &&
                          <button className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white" onClick={this.close} >Close Ticket</button>
                          || <div className=" br-3 mr-2">
                            <Badge key={post.id} size='default' color="bg-red-500 text-white" >
                              {this.state.ticket.status}
                            </Badge>
                          </div>}
                      </div>

                    </div>
                  </div>}
                  {(this.state.currentId && this.state.token) &&
                    <ChatTicket token={this.state.token} ticketId={this.state.currentId} user={this.state.user} />

                  }
                </div>
              </div>}
              {this.state.raiseTickets && this.state.raiseTickets.length <= 0 && <div className="text-center lg:mb-10 mb-4 mt-20">
                <img className="w-1/4 lg:w-1/5 mx-auto block" src="/images/search.png"></img>
                <h5 className="font-bold">No Data Available</h5>
                <p className="text-gray-400 mt-1">There is no data available in the table.</p>
              </div>}
            </div>
          </>
        }
      </>

    )
  }

}
