import { useState } from 'react'
import fetch from 'isomorphic-unfetch'
import ScrollableFeed from 'react-scrollable-feed'
import moment from 'moment'
import io from 'socket.io-client'
import { useEffect, useRef } from 'react'
import { fetchByID } from 'helpers/apiService'
import axios from 'axios';


const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL
const USER_JOIN_CHAT_EVENT = 'USER_JOIN_CHAT_EVENT';
const USER_LEAVE_CHAT_EVENT = 'USER_LEAVE_CHAT_EVENT';
const START_TYPING_MESSAGE_EVENT = "START_TYPING_MESSAGE_EVENT";
const STOP_TYPING_MESSAGE_EVENT = "STOP_TYPING_MESSAGE_EVENT";

export default function ChatTicket({ token, ticketId, user }, props) {
    const [messages, setMessages] = useState(props.messages || [])

    const socketRef = useRef();
    const [users, setUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);

    const [isTyping, setIsTyping] = useState(false);
    const [isKeyPressed, setIsKeyPressed] = useState(false);
    const [countdown, setCountdown] = useState(1);

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await axios.get(
                `${SOCKET_SERVER_URL}/rooms/${ticketId}/users?EIO=2&transport=polling`
            );
            const result = response.data.users;
            setUsers(result);
        };

        if (ticketId && ticketId != '') {
            fetchUsers();
        }
    }, [ticketId]);

    useEffect(() => {

        console.log(user)
        if (!user) {
            return;
        }
        if (!ticketId || ticketId == '') {
            return;
        }

        let roomId = ticketId

        socketRef.current = io(SOCKET_SERVER_URL, {
            query: { roomId, name: user.first_name, picture: user.image },
        });

        socketRef.current.on('connect', () => {
            console.log(socketRef.current.id);
        });

        const object = JSON.stringify({
            ticket_id: ticketId,
            token: token
        })

        // socket.emit('message.id', id)
        socketRef.current.emit('message.ticketBase', object)

        socketRef.current.on(USER_JOIN_CHAT_EVENT, (user) => {
            if (user.id === socketRef.current.id) return;
            setUsers((users) => [...users, user]);
        });


        socketRef.current.on(USER_LEAVE_CHAT_EVENT, (user) => {
            setUsers((users) => users.filter((u) => u.id !== user.id));
        });

        socketRef.current.on('message.ticketChat', (message) => {

            console.log(message)
            const incomingMessage = {
                ...message,
                ownedByCurrentUser: message.senderId === socketRef.current.id,
            };
            setMessages(message);
        });

        socketRef.current.on(START_TYPING_MESSAGE_EVENT, (typingInfo) => {
            if (typingInfo.senderId !== socketRef.current.id) {
                const user = typingInfo.user;
                setTypingUsers((users) => [...users, user]);
            }
        });
        socketRef.current.on(STOP_TYPING_MESSAGE_EVENT, (typingInfo) => {
            if (typingInfo.senderId !== socketRef.current.id) {
                const user = typingInfo.user;
                setTypingUsers((users) => users.filter((u) => u.name !== user.name));
            }
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [ticketId]);

    useEffect(() => {
        const fetchMessages = async () => {
            // const response = await axios.get(
            //     `${SOCKET_SERVER_URL}/rooms/${ticketId}/messages?EIO=2&transport=websocket&token=${token}`
            // );
            // const result = response.data.comments;


            // console.log(response.data.comments)

            var result = await fetchByID('raise-tickets', ticketId, { dateWise: true, noLog: true });
            setMessages(result);
        };

        if (ticketId && ticketId != '') {
            fetchMessages();
        }
    }, [ticketId]);

    const handleSubmit = (event, ref) => {

        event.preventDefault()

        if (!socketRef.current) return;

        const object = JSON.stringify({
            ticket_id: ticketId,
            token: token
        })

        // socket.emit('message.id', id)
        socketRef.current.emit('message.ticketBase', object)

        var f = document.getElementById('form')
        var form = new FormData(document.getElementById('form'));
        var inputValue = form.get("ticket");
        let body = {
            ticket_id: ticketId,
            message: inputValue,
            name: messages.ticket.name,
            mobile_number: messages.ticket.mobile_number,
            city: messages.ticket.city,
            ticket_type: 'RESPONSE',
            // user_image: messages.ticket.user_image,
        }


        // send object to WS server
        socketRef.current.emit('message.ticketChat', body)
        // setField('')
        // setMessages(messages => [...messages, body])

        if (f) {
            f.reset()
        }
    }


    useEffect(() => {
        if(isTyping){
            socketRef.current.emit(START_TYPING_MESSAGE_EVENT, {
                senderId: socketRef.current.id,
                user,
            });
        }else{
            socketRef.current.emit(STOP_TYPING_MESSAGE_EVENT, {
                senderId: socketRef.current.id,
                user,
            });
        }
    }, [isTyping]);


    const startTyping = () => {

        console.log('typing')
        setIsKeyPressed(true);
        setCountdown(5);
        setIsTyping(true);
      };
      const stopTyping = () => {
        setIsKeyPressed(false);
      };
      const cancelTyping = () => {
        setCountdown(0);
      };
      
      useEffect(() => {
        let interval;
        if (!isKeyPressed) {
          interval = setInterval(() => {
            setCountdown((c) => c - 1);
          }, 100);
        } else if (isKeyPressed || countdown === 0) {
          clearInterval(interval);
        }
        if (countdown === 0) {
          setIsTyping(false);
        }
        return () => clearInterval(interval);
      }, [isKeyPressed, countdown]);


    return (
        <>
            <div className="h-4/5 ">
                <div className="w-full h-full chatSection">
                    <ScrollableFeed>
                        {
                            messages && messages.raiseTicket && Object.keys(messages.raiseTicket).map((date, i) => {
                                return <div >
                                    <div className="w-full w-full flex items-center m-2 justify-center space-x-4">
                                        <span className=" px-2 bg-gray-200 rounded"><small>{date}</small></span>
                                    </div>
                                    {messages.raiseTicket[date] && messages.raiseTicket[date].map((ticket, i) => (
                                        <div
                                            className={`flex items-start m-2 ${ticket.ticket_type == 'RESPONSE' && ticket.response_by == user.id ? 'justify-end' : 'justify-start'} space-x-4`}
                                            key={i}>
                                            <div className={`flex flex-col lg:flex-row ${ticket.ticket_type == 'RESPONSE' && ticket.response_by == user.id ? 'chat own pr-4' : 'chat pl-4'}`}>
                                                <div className="flex flex-col w-full">
                                                    <div className="text-sm font-bold text-blue-500">{ticket.user_name}</div>
                                                    <div className="text-sm">{ticket.message}</div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <div className=" chat-time"><small>{moment(ticket.created_at).format('hh:mm A')}</small></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {
                                        typingUsers && typingUsers.map((typeuser, i) => {
                                            if (i == 0) {
                                                return <div
                                                    className={`flex items-start m-2 justify-start space-x-4`}
                                                    key={i}>
                                                    <div className={`flex flex-col lg:flex-row chat  pr-4`}>
                                                        <div className="flex flex-col w-full">
                                                            <div className="text-sm">{typeuser.first_name} {typeuser.last_name} are Typing ...</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        })
                                    }
                                </div>
                            })
                        }
                    </ScrollableFeed>


                </div>
            </div>

            {messages && messages.ticket && messages.ticket.is_user == 1 && <div className="chatbottom p-3">
                <div className=" botder-t">
                    <form method="POST" onSubmit={(e) => handleSubmit(e, socketRef.current)} id="form" className="form-element form-element-inline">


                        {/* <div className="w-1/6 px-1"><img alt={window.localStorage.getItem('defaultImageAlt')} src="/img/logo.png" /></div> */}
                        <input type="text" name="ticket"  id="ticket" onKeyPress={startTyping}
                            onKeyUp={stopTyping} className="form-input border-0 rounded ml-2" placeholder="Write your comment" rows="1" />
                        <div className="w-1/3 col-lg-2  text-center bg-base py-1 rounded text-white">
                            <button type="submit" id="send" className="btn btn-primary" value="send" ><i className="fas fa-paper-plane"></i> Send</button>
                        </div>
                    </form>
                </div>
            </div>}
        </>
    )
}
