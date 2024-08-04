const express = require('express');
const app = express();
const productRoute = require('./api/routes/product');
const userRoute = require('./api/routes/user');
const categoryRoute = require('./api/routes/category');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');

// MongoDB connection
mongoose.connect( process.env.MONGOURL , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', err => {
  console.log('Connection failed:', err);
});

mongoose.connection.on('connected', () => {
  console.log('Connected successfully with database');
});

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use temp files in a writable directory
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

app.use(cors());

// Routes
app.use('/product', productRoute);
app.use('/user', userRoute);
app.use('/category', categoryRoute);

// Fallback for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Not Found',
  });
});

module.exports = app;
