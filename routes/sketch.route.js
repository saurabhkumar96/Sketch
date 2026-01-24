const express =  require("express")
const router = express.Router();
const fs = require("fs")

router.get("/save", (req, res)=>{
    const {roomId, actions} = req.body
    
    fs.writeFileSync(`./saves/${roomId}.json`, JSON.stringify(actions))
    res.json({message:"saved"})
})


module.exports = router