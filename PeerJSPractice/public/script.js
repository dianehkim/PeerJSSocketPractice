const socket = io('/') //making socket
const videoGrid = document.getElementById('video-grid') //finding the Video-Grid element
const myPeer = new Peer(undefined, { //making the peer element which is the user
  host: 'localhost',
  port: '3001',
  secure: false
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream) //showing our video to ourselves


  myPeer.on('call', call => { //when we join the room, get a "call"
    call.answer(stream) //stream our video/audio
    const video = document.createElement('video') //create a video tag
    call.on('stream', userVideoStream => { //receiving their video stream
      addVideoStream(video, userVideoStream) //displaying their video 
    })
  })

  socket.on('user-connected', userId => { //when new user connects
    const fc = () => connectToNewUser(userId, stream)
    timerid = setTimeout(fc, 1000 )
    
  })
})



socket.on('user-disconnected', userId => { //when user disconnects or closes window
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => { //when first open, you can join a room
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) { //when someone joins our room
  const call = myPeer.call(userId, stream) //calling person that joined
  const video = document.createElement('video') //adding the person's video
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {//once they leave, remove their video display
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {//stream video while it's being loaded
    video.play()
  })
  videoGrid.append(video) //add video to the videoGrid
}

