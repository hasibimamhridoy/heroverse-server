const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000



app.get('/',(req,res)=>{
    res.send(`The server is running.The port is: ${port}`);
})
app.listen(port,()=>{
    console.log(`The server is running.The port is: ${port}`);
})