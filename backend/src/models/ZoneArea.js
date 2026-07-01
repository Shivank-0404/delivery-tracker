const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ZoneArea = sequelize.define('ZoneArea', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  zone_id: { type: DataTypes.UUID, allowNull: false },
  area_keyword: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'zone_areas', underscored: true });

module.exports = ZoneArea;
