const socket = io();

const canvas = document.getElementById("board")
const ctx = canvas.getContext("2d")

let drawing = false
const actions = []

function handleAction(action) {
    if (action.type === "start") {
        ctx.beginPath()
        ctx.moveTo(action.x, action.y)
        ctx.strokeStyle = action.color
        ctx.lineWidth = action.width
        ctx.lineCap = "round"
    }

    if (action.type === "move") {
        ctx.lineTo(action.x, action.y)
        ctx.stroke()
    }

    if (action.type === "end") {
        ctx.closePath()
    }
    if (action.type === "clear-canvas") {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
}

canvas.addEventListener("mousedown", (e) => {
    drawing = true

    const action = {
        type: "start",
        x: e.offsetX,
        y: e.offsetY,
        color: "black",
        width: 3
    }

    sendAction(action)
    // handleAction(action)
})

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return

    const action = {
        type: "move",
        x: e.offsetX,
        y: e.offsetY
    }
    sendAction(action)
    // handleAction(action)
})

canvas.addEventListener("mouseup", () => {
    drawing = false

    const action = {
        type: "end"
    }
    sendAction(action)

    // handleAction(action)
})


const clearBtn = document.getElementById("clearBtn")
clearBtn.addEventListener("click",(e)=>{
    // ctx.clearRect(0, 0, canvas.width, canvas.height)
    const action = {
        type: "clear-canvas"
    }
    sendAction(action)
})



// uses of socketio information
function sendAction(action) {
    handleAction(action)
    socket.emit("draw", action)
}

function getRoomIdFromURL() {
  const parts = window.location.pathname.split("/")
  return parts[1] === "room" ? parts[2] : null
}
const roomId = getRoomIdFromURL()

let roomIdBtn = document.getElementById("roomIdBtn")
roomIdBtn.innerText = `room id: ${roomId}`
roomIdBtn.style.cursor ="pointer"

roomIdBtn.addEventListener("click",()=>{
    navigator.clipboard.writeText(roomId)
    alert("room id copied")
})

if(roomId){
    socket.emit("join-room", roomId)
}else {
  console.log("No room → do not join anything")
}

socket.on("init-canvas", (actions) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    actions.forEach(action => {
        return handleAction(action)
    });
})

socket.on("draw", (action) => {
    
    handleAction(action)
})

document.getElementById("saveBtn").addEventListener("click", async () => {
    await fetch("/save", {
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({roomId, actions}),
    })
    alert ("sketch saved")
})

// this is going for homebtn
homeBtn = document.getElementById("homeBtn").addEventListener("click",()=>{
    window.location.href = "/"
})

document.getElementById("copyLink").addEventListener("click", ()=>{
    const link = window.location.href
    navigator.clipboard.writeText(link)
    alert("link copied")
})


// ------------------------------------------------------------
// webrtc
// const stream = navigator.mediaDevices.getUserMedia({
//   video: true,
//   audio: true
// })


// Get camera + mic (frontend only)
let localStream
async function getMedia() {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  })

  document.getElementById("localVideo").srcObject = localStream
}


// Create PeerConnection (frontend core)
let pc

function createPeerConnection() {
  pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  })

  // send ICE candidates
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("webrtc-ice", {
        roomId,
        candidate: e.candidate
      })
    }
  }

  // receive remote stream
  pc.ontrack = (event) => {
    document.getElementById("remoteVideo").srcObject =
      event.streams[0]
  }

  // add local tracks
  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream)
  })
}

// Start call (create OFFER)
document.getElementById("startCall").onclick = async () => {
  await getMedia()
  createPeerConnection()

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)

  socket.emit("webrtc-offer", { roomId, offer })
}

// Handle OFFER (other user)
socket.on("webrtc-offer", async (offer) => {
  await getMedia()
  createPeerConnection()

  await pc.setRemoteDescription(offer)

  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)

  socket.emit("webrtc-answer", { roomId, answer })
})

// Handle ANSWER (caller receives)
socket.on("webrtc-answer", async (answer) => {
  await pc.setRemoteDescription(answer)
})

// Handle ICE candidates (both sides)
socket.on("webrtc-ice", async (candidate) => {
  if (candidate) {
    await pc.addIceCandidate(candidate)
  }
})

// Mic / Camera toggle (frontend UX)
document.getElementById("toggleMic").onclick = () => {
  localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled
}

document.getElementById("toggleCam").onclick = () => {
  localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled
}

// URL (/room/:id)
//   ↓
// Socket.IO joins room
//   ↓
// Canvas actions sync
//   ↓
// WebRTC signaling via Socket.IO
//   ↓
// Media flows peer-to-peer

