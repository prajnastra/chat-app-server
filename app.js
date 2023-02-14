const app = require('express')()
const Gun = require('gun')
const http = require('http').Server(app)
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})

io.on('connection', (socket) => {
  const id = socket.handshake.query.id
  socket.join(id)

  socket.on('send-message', ({ recipients, text }) => {
    recipients.forEach((recipient) => {
      const newRecipients = recipients.filter((r) => r !== recipient)
      newRecipients.push(id)
      socket.broadcast.to(recipient).emit('receive-message', {
        recipients: newRecipients,
        sender: id,
        text,
      })
    })
  })
})


app.use(Gun.serve)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const port = process.env.PORT || 8000

const server = http.listen(port, function () {
  console.log(`Socket listening on ${port}`)
  console.log(`Gun listening on ${port}`)
})

Gun({ web: server })
