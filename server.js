const express = require("express");
const dotenv = require("dotenv").config();
const db = require("./config/db")();
const http = require("http");
const { Server } = require("socket.io");
const Session = require("./model/session.model")
const ActivityLog = require("./model/activity.model")

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
  socket.on("join-room", async (data) => {
    const { roomId, screen } = data
    console.log(screen)
    if (!roomId) return

    socket.join(roomId)
    socket.roomId = roomId

    // 👉 SAVE SESSION (IMPORTANT PART)
    try {
      await Session.create({
        userId: socket.userId || null,  // if login exists
        sessionId: socket.id,
        roomId,
        screen,
        lastLogin: new Date(),
        lastActiveAt: new Date()
      });
    } catch (err) {
      console.error("Session save error:", err);
    }

    if (!rooms.has(roomId)) {
      rooms.set(roomId, [])
    }
    socket.emit("init-canvas", rooms.get(roomId))
  })


  // draw
  socket.on("draw", async (action) => {
    // jissme mera code nahi fatega()
    if (!socket.roomId) return
    rooms.get(socket.roomId).push(action)
    socket.to(socket.roomId).emit("draw", action)

    // 👉 ONLY track important events
    if (action.type === "start" || action.type === "end") {

      const now = Date.now()
      const lastUpdate = 0

      if(now-lastUpdate > 5000){
      // update last activity
        await Session.updateOne(
          { sessionId: socket.id },
          { $set: { lastActiveAt: new Date() } }
        );

      }
      

      // optional: log activity
      ActivityLog.create({
        userId: socket.userId || null,
        roomId: socket.roomId,
        action: action.type === "start" ? "DRAW_START" : "DRAW_END",
        entityType: "CANVAS",
        metadata: action
      }).catch(console.error);
    }

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

  socket.on("share-screen", (...args) => {
    socket.to(socket.roomId).emit("share-screen", ...args)
  })

  // disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
