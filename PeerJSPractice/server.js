require("dotenv").config();
//making express and socket.io servers
const express = require('express'); //express server
const app = express(); //app variable = to running express function
const http = require('http').Server(app); //server is being made to use socket.io --passes in app object
const https = require('https').Server(sslOptions, app); //USE AND DIFFERENTIATE HTTP and HTTPS
const path = require("path");
var PORT = process.env.PORT || 3000;
const { v4: uuidV4 } = require('uuid');
app.set('view engine', 'ejs'); // how were going to render our views (used ejs library)
const io = require('socket.io')(http);
var fs = require('fs');
//express config when client connects to server at 443
var PeerServer = require('peer').PeerServer ({
    port: 443,
    proxied: true,
    ssl: {key: fs.readFileSync('/Users/diane/server.key'),
    certificate: fs.readFileSync('/Users/diane/server.crt')}
});
const { ExpressPeerServer } = require('peer');
// const expressPeerServer = ExpressPeerServer(http, {
//     debug: true
// });

var sslOptions = { //accessing ssl key and certificate
    key: fs.readFileSync('/Users/diane/server.key'),
    cert: fs.readFileSync('/Users/diane/server.crt')
  };

var server = http.listen(PORT);
https.listen(443);

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// app.use('/peerjs', expressPeerServer);
app.use('/peer', ExpressPeerServer(server, {debug:true}));
app.use('/peerjs', PeerServer);
app.use(express.static('public')); // put all js and css in public folder, express.static is rendered through script

app.get('/', (req, res) => { //takes in request and response create a brand new room and redirect user to that room
    res.redirect(`/${uuidV4()}`); // want a dynamic room (uses the uuid)
});

//if join a specific room, it'll be rendered
app.get('/:room', (req, res) => { //route for the room, dynamic parameter
    res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => { //when someone connects to a room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        console.log(userId);

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
        });
    });
});

// if (process.env.PROD){
//     app.use(express.static(path.join(__dirname, './server.js')));
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(__dirname, './room.ejs'));
//     });
// }

