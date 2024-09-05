const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const propertyRoutes = require('./routes/propertyRoute');
const authRoutes = require('./routes/authRoute');
const inboxRoutes = require('./routes/inboxRoute');
const profileRoutes = require('./routes/profileRoute');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const app = express();

const fileStorage =  multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'images');
  },
  filename: function(req, file, cb) {
      cb(null, uuidv4())
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(morgan('dev'));
app.use(express.json()); // application/json
app.use(express.urlencoded({extended : true}));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array('images')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/property', propertyRoutes);
app.use('/auth', authRoutes);
app.use('/inbox', inboxRoutes);
app.use('/profile', profileRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

let connectPort = async(portNumb) => {
  await mongoose.connect(process.env.DBURL);
  await mongoose.connection.syncIndexes();
  console.log("connected");
  app.listen(portNumb);
};
try {
  connectPort(3000);
}
catch(err) {
  console.log(err);
}

//----------------------------//