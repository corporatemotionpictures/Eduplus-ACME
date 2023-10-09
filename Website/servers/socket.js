import { verifyToken } from 'helpers/api'

const fetch = require('isomorphic-unfetch')
// const verifyToken = require('./helpers/api')
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 5000
const dev = process.env.NODE_ENV == 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

// fake DB
const messages = {
  chat: [],
}

var eventID = 10;

// middleware
io.use((socket, next) => {
  let token = socket.handshake.query.token;
  if (verifyToken(token)) {
    return next();
  }
  return next(new Error('authentication error'));
});

// socket.io server
io.on('connection', async (socket) => {
  console.log('hello app coneected with this ')

  socket.emit('check', 'ckeck for emit')

  
  const response = await fetch('http://localhost:3000/api/v1/event-comments?eventID='+eventID)
  const comments = await response.json()
  messages['chat'] = comments.comments;


  // messages['chat'].push(data) // response
  socket.broadcast.emit('message.chat',  messages['chat'])

  console.log(socket.connected)

  socket.on('message.id', async(data) => {
    console.log(data)
    eventID = data;

    const response = await fetch('http://localhost:3000/api/v1/event-comments?eventID='+eventID)
    const comments = await response.json()
    messages['chat'] = comments.comments;
    })

  socket.on('message.chat', async(data) => {
    // console.log(data) // before add

    let commentAdd = await fetch('http://localhost:3000/api/v1/event-comments/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'x-auth-token': token
      },
      body: JSON.stringify(data)
    });

    // commentAdd = await commentAdd.json()
    console.log(commentAdd)
    console.log(eventID)

    const response = await fetch('http://localhost:3000/api/v1/event-comments?eventID='+eventID)
    const comments = await response.json()
    messages['chat'] = comments.comments;
  

    // messages['chat'].push(data) // response
    socket.broadcast.emit('message.chat',  messages['chat'])

  })
})

nextApp.prepare().then(() => {
  app.get('/messages/:chat', (req, res) => {
    console.log(req.params.chat)
    res.json(messages[req.params.chat])
  })

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}/socket`)
  })
})
