const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  customerName:    { type: DataTypes.STRING, allowNull: false },
  customerEmail:   { type: DataTypes.STRING, allowNull: false },
  customerPhone:   { type: DataTypes.STRING, allowNull: false },
  customerAddress: { type: DataTypes.TEXT, allowNull: false },
  // Array payload stored safely as an escaped JSON string text sequence
  items:           { type: DataTypes.TEXT, allowNull: false }, 
  subtotal:        { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  shipping:        { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  tax:             { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  total:           { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paymentMode:     { type: DataTypes.ENUM('COD', 'UPI', 'CARD', 'NETBANKING'), defaultValue: 'COD' },
  status:          { type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
  notes:           { type: DataTypes.TEXT, allowNull: true }
}, {
  timestamps: true // Automatically creates createdAt and updatedAt columns
});

module.exports = Order;