### STEP 1: Create the drawing surface (Canvas)
* Mouse down starts drawing
* Mouse move draws continuous line
* Mouse up stops drawing
* Stroke width works
* Color works
* No gaps or jitter
### STEP 2: Convert drawing into actions (NOT pixels)
### STEP 3: Establish WebSocket connection
### STEP 4: Create rooms (Room ID / Shareable link)
### ✅ STEP 4 — State sync for late joiners (the real problem)
* User A draws for 5 minutes
* User B joins later
* User B sees blank canvas

### Core rule of STEP 4 (non-negotiable)
- Server must store actions per room
New user must replay them

STEP 5: Real-time drawing sync

### implementtation of clear btn 

You unlocked these features (even if you didn’t code them yet)

Because STEP 4 is done correctly, these become possible:

### Feature	Possible now?	Why
Save sketch	    ✅	Actions already stored
Load sketch	    ✅	Replay actions
Undo / Redo	    ✅	Actions are discrete
Export PNG	    ✅	Re-render anytime
Realtime sync	✅	Already working
Version history	✅	Event log exists


First user draws → actions stored
Second user joins same room
Server sends past actions
Client replays actions
Canvas looks identical

Video ON/OFF
 Mic ON/OFF
 1–2 users only
 Same room only
 No recording yet
