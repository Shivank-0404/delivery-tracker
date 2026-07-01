const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrackingHistory = sequelize.define('TrackingHistory', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  notes: { type: DataTypes.TEXT },
  actor_id: { type: DataTypes.UUID },
  actor_role: { type: DataTypes.ENUM('admin', 'customer', 'agent', 'system') },
}, {
  tableName: 'tracking_history',
  underscored: true,
  updatedAt: false,
});

module.exports = TrackingHistory;
