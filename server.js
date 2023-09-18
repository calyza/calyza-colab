const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const studioManager = require('./studio/manager')
const chatsManager = require('./studio/chats')

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

    const connectedUsers = studioManager.getConnectedUsersInStudio(data.studioId)
    connectedUsers.forEach(userId => {
      if (userId !== data.userId) {
        const userSocketId = studioManager.getUserSocketIdInStudio(data.studioId, userId)
        io.to(userSocketId).emit('userPathChanged', { userId: data.userId, path: data.path })
      }
    })
  })

  socket.on('updateStatus', (data) => {
    console.log('State:', data.status)
    console.log('ID User:', data.userId)
    console.log('ID Studio:', data.studioId)

    studioManager.updateUserStatus(data.studioId, data.userId, data.status)

    const connectedUsers = studioManager.getConnectedUsersInStudio(data.studioId)

    connectedUsers.forEach(userId => {
      if (userId !== data.userId) {
        const userSocketId = studioManager.getUserSocketIdInStudio(data.studioId, userId)
        io.to(userSocketId).emit('userStatusChanged', { userId: data.userId, newStatus: data.status, path: data.path })
      }
    })
  })

  socket.on('requestConnectedUsers', (data) => {
    const studioId = data.studioId
    const connectedUsers = studioManager.getConnectedUsersInStudio(studioId)
    socket.emit('connectedUsersList', connectedUsers)
  })

  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado')
    studioManager.removeUserFromStudio(socket.id)
  })

  socket.on('startChat', (data) => {
    const chatId = chatsManager.generateUniqueChatId(data.userIds)
    socket.join(chatId)

    data.userIds.forEach(userId => {
      const socketId = studioManager.getUserSocketIdInStudio(data.studioId, userId)
      socket.to(socketId).emit('chatStarted', data.userIds)
    })
  })

  socket.on('sendMessage', (data) => {
    data.userIds.forEach(userId => {
      const socketId = studioManager.getUserSocketIdInStudio(data.studioId, userId)
      socket.to(socketId).emit('messageReceived', { message: data.message })
    })
  })
})

const PORT = 8080
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
