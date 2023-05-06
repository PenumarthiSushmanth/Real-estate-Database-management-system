const express = require("express")
const bodyparser = require("body-parser")
const route = require("./Route/Routing")
var cors = require('cors');

const app = express()
app.use(cors())
app.use(bodyparser.json())
app.use("/", route)

const port = process.env.PORT || 4050;

app.listen(port, function(){
    console.log(`Server started at ${port}...`)
})