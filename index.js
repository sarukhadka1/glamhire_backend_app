const express = require("express");
const connectDatabase = require("./database/database");
const dotenv = require("dotenv");
const cors = require("cors");
const acceptFormData = require('express-fileupload');
const https = require('https')
const fs = require('fs')
const path = require('path');


// Creating an express application
const app = express();

//Configure Cors Policy
const corsOptions = {
    origin: true,
    credentials: true,
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));

//Express Json Config
app.use(express.json());

//Config form data
app.use(acceptFormData());

//Make a static public folder
app.use(express.static("./public"));

// dotenv configuration
dotenv.config();

//Defining the port
const PORT = process.env.PORT || 5000;

// Connecting to Database
connectDatabase();

//Making a test endpoint
app.get("/test", (req, res) => {
    res.send("Test api is working..");
});

// Configuring Routes of User
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/booking',require('./routes/bookingRoutes'))
app.use('/api/artist',require('./routes/artistRoutes'));
app.use('/api/rating',require("./routes/reviewRoutes"));
app.use('/api/wishlist',require("./routes/wishlistRoutes"));
app.use('/api/contact', require('./routes/contactRoutes'))
app.use('/api/payment', require('./routes/PaymentRoutes'))


//Starting the server
const options = {
    key: fs.readFileSync(path.resolve(__dirname, "server.key")),
    cert: fs.readFileSync(path.resolve(__dirname, "server.crt")),
   
  };
   
   
  // Start HTTPS server
  https.createServer(options, app).listen(PORT, () => {
    console.log(`Secure server is running on port ${PORT}`);
});
module.exports= app;