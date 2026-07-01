const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID },
  user_id: { type: DataTypes.UUID },
  channel: { type: DataTypes.ENUM('email', 'sms') },
  message: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('sent', 'failed', 'skipped'), defaultValue: 'sent' },
  sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'notifications', underscored: true, updatedAt: false });

module.exports = Notification;
