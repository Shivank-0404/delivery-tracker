const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'customer', 'agent'),
      allowNull: false,
      defaultValue: 'customer',
    },
    phone: { type: DataTypes.STRING },
    lat: { type: DataTypes.FLOAT },
    lng: { type: DataTypes.FLOAT },
    zone_id: { type: DataTypes.UUID },
    is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: 'users', underscored: true }
);

module.exports = User;
