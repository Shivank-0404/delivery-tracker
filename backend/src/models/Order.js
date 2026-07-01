const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  customer_id: { type: DataTypes.UUID, allowNull: false },
  agent_id: { type: DataTypes.UUID },
  pickup_address: { type: DataTypes.TEXT, allowNull: false },
  drop_address: { type: DataTypes.TEXT, allowNull: false },
  pickup_zone_id: { type: DataTypes.UUID },
  drop_zone_id: { type: DataTypes.UUID },
  length: { type: DataTypes.FLOAT, allowNull: false },
  breadth: { type: DataTypes.FLOAT, allowNull: false },
  height: { type: DataTypes.FLOAT, allowNull: false },
  actual_weight: { type: DataTypes.FLOAT, allowNull: false },
  volumetric_weight: { type: DataTypes.FLOAT },
  billed_weight: { type: DataTypes.FLOAT },
  order_type: { type: DataTypes.ENUM('B2B', 'B2C'), allowNull: false },
  payment_type: { type: DataTypes.ENUM('Prepaid', 'COD'), allowNull: false },
  delivery_charge: { type: DataTypes.DECIMAL(10, 2) },
  cod_surcharge: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total_charge: { type: DataTypes.DECIMAL(10, 2) },
  status: {
    type: DataTypes.ENUM('Pending', 'Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed'),
    defaultValue: 'Pending',
  },
  scheduled_date: { type: DataTypes.DATEONLY },
  rescheduled_date: { type: DataTypes.DATEONLY },
  created_by_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'orders', underscored: true });

module.exports = Order;
