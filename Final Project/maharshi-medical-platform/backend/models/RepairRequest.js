const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RepairRequest = sequelize.define('RepairRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  machineName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  problem: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  urgency: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Emergency'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = RepairRequest;