const express = require("express")
const errorHandler = require("./middleware/errorhandler")
const dotenv = require("dotenv").config()


const app = express()

const port = process.env.PORT || 5000

app.use(express.json())
app.use("/api/contacts", require("./routes/contactRountes"))
app.use(errorHandler)

app.listen(port, () => {
    console.log(`On the server port: ${port}`)
})