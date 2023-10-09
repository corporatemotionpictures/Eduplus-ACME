const fetch = require('isomorphic-unfetch')
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')
const port = parseInt(process.env.PORT, 10) || 3001
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()
// Assign API Url const 
const domainUrl = 'http://localhost:3001';
const apiUrl = domainUrl.concat("/api/v1");
const USER_JOIN_CHAT_EVENT = 'USER_JOIN_CHAT_EVENT';
const USER_LEAVE_CHAT_EVENT = 'USER_LEAVE_CHAT_EVENT';
const START_TYPING_MESSAGE_EVENT = "START_TYPING_MESSAGE_EVENT";
const STOP_TYPING_MESSAGE_EVENT = "STOP_TYPING_MESSAGE_EVENT";
//Get Url 
function getUrl(ctx) {
    return apiUrl.concat(ctx);
}

// fake DB
const messages = {
    chat: [],
    ticketChat: [],
}

const users = [];
const addUser = (id, room, name) => {
    const existingUser = users.find(
        (user) => user.room === room && user.name === name
    );
    const user = { id, name, room };
    users.push(user);
    return { id, name: user.name };
};
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) return users.splice(index, 1)[0];
};
const getUser = (id) => users.find((user) => user.id === id);
const getUsersInRoom = (room) => users.filter((user) => user.room === room);
var uuid = require('uuid');
// socket.io server
io.on('connection', async (socket) => {
    console.log('connected ksdcksdcklnsdcslkdncsdclsdkncksd cksdnckl')
    socket.emit('check', 'ckeck for emit')
    socket.on('message.base', async (baseData) => {
        baseData = JSON.parse(baseData)
        eventID = baseData.event_id;
        token = baseData.token;
        const response = await fetch(getUrl('/event-comments?eventID=' + eventID))
        const comments = await response.json()
        messages['chat'] = comments.comments;
        console.log('connectedbase')
        // messages['chat'].push(data) // response
        socket.broadcast.emit('message.chat', messages['chat'])
    })
    socket.on('message.chat', async (data) => {
        let commentAdd = await fetch(getUrl('/event-comments/add'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(data)
        });
        const response = await fetch(getUrl('/event-comments?eventID=' + eventID))
        const comments = await response.json()
        messages['chat'] = comments.comments;
        // messages['chat'].push(data) // response
    })
    if (messages['chat']) {
        socket.broadcast.emit('message.chat', messages['chat'])
    }
    // Join a conversation
    const { roomId, name } = socket.handshake.query;
    socket.join(roomId);
    const user = addUser(socket.id, roomId, name);
    io.in(roomId).emit(USER_JOIN_CHAT_EVENT, user);
    // Listen typing events
    socket.on(START_TYPING_MESSAGE_EVENT, (data) => {
        io.in(roomId).emit(START_TYPING_MESSAGE_EVENT, data);
    });
    socket.on(STOP_TYPING_MESSAGE_EVENT, (data) => {
        io.in(roomId).emit(STOP_TYPING_MESSAGE_EVENT, data);
    });
    socket.on('message.ticketBase', async (baseData) => {
        baseData = JSON.parse(baseData)
        ticketID = baseData.ticket_id;
        token = baseData.token;
        const response = await fetch(getUrl(`/raise-tickets/${ticketID}?dateWise=true&&noLog=true`), {
            headers: {
                'x-auth-token': token
            },
        })
        const comments = await response.json()
        messages['ticketChat'] = comments.comments;
        console.log('connectedbase')
        // messages['ticketChat'].push(data) // response
    })
    if (messages['ticketChat']) {
        io.in(roomId).emit('message.ticketChat', messages['ticketChat'])
    }
    socket.on('message.ticketChat', async (data) => {
        let commentAdd = await fetch(getUrl('/raise-tickets/add'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(data)
        });
        const response = await fetch(getUrl(`/raise-tickets/${ticketID}?dateWise=true&&noLog=true`), {
            headers: {
                'x-auth-token': token
            },
        })
        const comments = await response.json()
        messages['ticketChat'] = comments;
        // messages['ticketChat'].push(data) // response
        io.in(roomId).emit('message.ticketChat', messages['ticketChat'])
    })
    socket.on('disconnect', () => {
        removeUser(socket.id);
        io.in(roomId).emit(USER_LEAVE_CHAT_EVENT, user);
        socket.leave(roomId);
    });
})