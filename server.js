const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

// for frontend page
app.use("/", require("./routes/frontend.route"));

// creating router for the comming from the server
app.use("/api", require("./routes/sketch.route"))

app.get("/", (req, res) => {
  res.render("comming from the server")
});

// roomId → [ action, action, action ] 
const rooms = new Map()

// for socket
io.on("connection", (socket) => {
    console.log("a user connected");

    
//   join room
  socket.on("join-room" , (roomId)=>{   
    if(!roomId) return 

    socket.join(roomId)
    socket.roomId = roomId
    
    if (!rooms.has(roomId)) {
        rooms.set(roomId, [])
    }
    socket.emit("init-canvas", rooms.get(roomId))
  })


// draw
socket.on("draw", (action)=>{
  // jissme mera code nahi fatega()
    if(!socket.roomId) return

    rooms.get(socket.roomId).push(action)
    socket.to(socket.roomId).emit("draw",action)
})


// ------------------------------------------------------
// for webrtc
socket.on("webrtc-offer", ({ roomId, offer }) => {
  socket.to(roomId).emit("webrtc-offer", offer)
})

socket.on("webrtc-answer", ({ roomId, answer }) => {
  socket.to(roomId).emit("webrtc-answer", answer)
})

socket.on("webrtc-ice", ({ roomId, candidate }) => {
  socket.to(roomId).emit("webrtc-ice", candidate)
})

// disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000);
