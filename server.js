const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const studioManager = require('./studio-manager/manager')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-colab'],
    credentials: true
  }
})

app.use(cors())

app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!')
})

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado')

  socket.on('pathChanged', (data) => {
    console.log('Path:', data.path)
    console.log('ID User:', data.userId)
    console.log('ID Studio:', data.studioId)

    studioManager.addUserToStudio(data.studioId, data.userId, socket.id, data.path)
  })

  socket.on('updateStatus', (data) => {
    console.log('State:', data.status)
    console.log('ID User:', data.userId)
    console.log('ID Studio:', data.studioId)

    studioManager.updateUserStatus(data.studioId, data.userId, data.status)
  })

  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado')
    studioManager.removeUserFromStudio(socket.id)
  })
})

const PORT = 8080
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
