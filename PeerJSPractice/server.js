//making express and socket.io servers
const express = require('express') //express server
const app = express() //app variable = to running express function
const server = require('http').Server(app) //server is being made to use socket.io --passes in app object
const io = require('socket.io')(server) //pass in the server to return of the require function
const { v4: uuidV4 } = require('uuid') 
const cors = require('cors')

app.set('view engine', 'ejs') // how were going to render our views (used ejs library)
app.use(express.static('public')) // put all js and css in public folder, express.static is rendered through script
app.use(cors());

app.get('/', (req, res) => { //takes in request and response create a brand new room and redirect user to that room
  res.redirect(`/${uuidV4()}`) // want a dynamic room (uses the uuid)
})

//if join a specific room, it'll be rendered
app.get('/:room', (req, res) => { //route for the room, dynamic parameter
  res.render('room', { roomId: req.params.room }) 
})

io.on('connection', socket => { //when someone connects to a room
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)
    console.log(userId)

    socket.on('disconnect', () => {
        socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})


server.listen(3000) //sets up server on port 3000
//will be Cannot GET / when first starting up

