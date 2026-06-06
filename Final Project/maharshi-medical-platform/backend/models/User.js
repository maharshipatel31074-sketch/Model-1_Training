const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Ensures no duplicate accounts
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false // This will store the hashed password, NOT the raw text
  }
}, {
  timestamps: true
});

module.exports = User;