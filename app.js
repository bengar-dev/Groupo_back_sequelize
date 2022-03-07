const express  = require('express')
const app = express();
const { Sequelize, DataTypes } = require('sequelize')
var mysql = require('mysql');
dotenv = require('dotenv').config();

const userRoutes = require('./routes/user.js');
const postRoutes = require('./routes/post.js');

const path = require('path');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_MDP, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
})

const connect = async () => {
  try {
    sequelize.authenticate();
    console.log('Connecté à la base de données MySQL!');
  } catch (error) {
    console.error('Erreur dans la connection à la base de données:', error);
  }
}

connect()

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
  });

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);

module.exports = app;
