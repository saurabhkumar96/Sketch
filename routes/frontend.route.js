const express = require("express");
const router = express.Router();
const Session = require("../model/session.model")
const ActivityLog = require("../model/activity.model")

router.get("/", (req, res) => {
  res.render("index");
});

// router.get("/room/:roomId", (req, res) => {
//   res.render("room");
// });

// router.get("/room/:roomId", async (req, res) => {
//   const { roomId } = req.params;

//   try {
//     const logs = await ActivityLog.find({ roomId })
//       .sort({ createdAt: -1 })
//       .limit(20);

//     const session = await Session.findOne({ roomId });

//     console.log("LOGS:", logs); // 🔍 debug

//     res.render("room", {
//       roomId,
//       logs,
//       session
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error loading room");
//   }
// });
router.get("/room/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const logs = await ActivityLog.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(20);

    const sessions = await Session.find({ roomId })
      .sort({ lastActiveAt: -1 });

    res.render("room", {
      roomId,
      logs,
      sessions
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

router.get("/session/:userId", async (req, res) => {
  // const session = await Session.findOne({ userId: req.params.userId || null });
  const session = {abc:123}
  res.send(session);
});

router.get("/logs/:roomId", async (req, res) => {
  const logs = await ActivityLog.find({ roomId: req.params.roomId })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(logs);
});

module.exports = router;