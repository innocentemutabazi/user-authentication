const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const organisationRoutes = require('./routes/organisationRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/api/organisations', organisationRoutes);

// Database connection
sequelize.sync().then(() => {
  console.log('Database connected successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

module.exports = app;
