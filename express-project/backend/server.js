const express = require("express");
const errorHandler = require("./middleware/errorhandler");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv").config();
connectDb();

const app = express();

const port = process.env.PORT || 5001;

app.use(express.json());
app.use("/api/contacts", require("./routes/contactRoutes")); // Ensure the route is correct
app.use(errorHandler); // Error handler should be last

app.listen(port, () => {
  console.log(`On the server port: ${port}`);
});
