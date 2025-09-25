// app.js
const express = require('express');
const sequelize = require('./config/database');
const bodyParser = require('body-parser');
const usersRoute = require('./routes/users');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', usersRoute);

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Database test
sequelize.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database connection error:', err));

module.exports = app;
