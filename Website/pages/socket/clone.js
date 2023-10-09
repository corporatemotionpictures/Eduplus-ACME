import { useState } from 'react'
import fetch from 'isomorphic-unfetch'
import ScrollableFeed from 'react-scrollable-feed'
import moment from 'moment'
import io from 'socket.io-client'
import { useEffect } from 'react'

export default function ChatOne({ token, eventId, user_id }, props) {
  const [field, setField] = useState("")
  const [newMessage, setNewMessage] = useState(0)
  const [messages, setMessages] = useState(props.messages || [])

  const socketIO = io('/socket')


  useEffect(() => {
    async function getInnerdata() {
      if (newMessage == 0) {
        const msg = await getData(eventId);
        setMessages(msg.messages);
      }
    }

    getInnerdata()

    return setNewMessage(1)
  })

  function useSocket(eventName, cb) {
    useEffect(() => {
      socketIO.on(eventName, cb)

      return function useSocketCleanup() {
        socketIO.off(eventName, cb)
      }
    }, [eventName, cb])

    return () => { console.log('true') }
  }


  const socket = useSocket('message.chat', message => {
    setMessages(message)
  })

  const object = JSON.stringify({
    event_id: eventId,
    token: token
  })


  // socket.emit('message.id', id)
  socket.emit('message.base', object)

  const handleSubmit = event => {
    event.preventDefault()

    // create message object
    const message = {
      "event_id": eventId,
      "comment": field,
    }


    // send object to WS server
    socket.emit('message.chat', message)
    setField('')
    setMessages(messages => [...messages, message])
  }


  return (

    <main>
      <link href="/css/dashboard/argon.min.css" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css?family=Lexend+Deca&display=swap" rel="stylesheet" />
      <link href="/vendor/nucleo/css/nucleo.css" rel="stylesheet" />
      <link href="/vendor/@fortawesome/fontawesome-free/css/all.min.css" rel="stylesheet" />
      <link href="/css/dashboard/style.css" rel="stylesheet" />
      <div>
        <div className="mb-1 ">
          <div className="div-fix">
            <ScrollableFeed>
              {messages && messages.length > 0 && messages.map(message => (
                <div className="media px-4 py-1">
                  <div className=
                    {
                      message.user_id && message.user_id != user_id && 'media-body' || 'media-body text-right '
                    }>
                    <div className="">
                      {message.user_id != user_id && <p className="mb-0">
                        {(message.user_first_name && message.user_first_name.concat(' ' + message.user_last_name))}
                      </p>}
                      <p className={
                        message.user_id && message.user_id != user_id && 'bg-user px-4  mx-1 py-1 my-1' || 'px-4  mx-1 py-1  my-1 bg-admin'
                      }> <span className>
                          {message.comment}

                          <label className="
text-xs text-secondory text-right pl-4 pr-0">{moment(message.created_at).fromNow()}</label>
                        </span></p>

                    </div>

                  </div>
                </div>
              ))}
            </ScrollableFeed>
          </div>
          <hr />
        </div>


        <form onSubmit={handleSubmit}>
          <div className="media align-items-center p-2 pl-3">
            <div className="media-body">
              <div className="row">
                <div className="col-10">
                  <textarea value={field} className="form-control" placeholder="Write your Comment" onChange={e => setField(e.target.value)} rows="1"></textarea>
                </div>
                <div className="col-2">
                  <input type="submit" className="btn btn-info float-right w-100" value="send" />
                </div>
                <div className="col-8">
                </div>

              </div>
            </div>
          </div>

        </form>
      </div>

    </main>
  )
}

async function getData(eventId) {
  // Assign API Url const 
  var socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  const apiUrl = socketUrl.concat("/api/v1");

  //Get Url 
  function getUrl(ctx) {
    return apiUrl.concat(ctx);
  }


  socketUrl = getUrl('/event-comments?eventID=' + eventId);

  const response = await fetch(`${socketUrl}`)
  var messages = await response.json()
  messages = messages.comments;


  return { messages }
}