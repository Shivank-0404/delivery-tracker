const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RateCard = sequelize.define('RateCard', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_type: { type: DataTypes.ENUM('B2B', 'B2C'), allowNull: false },
  from_zone_id: { type: DataTypes.UUID, allowNull: false },
  to_zone_id: { type: DataTypes.UUID, allowNull: false },
  base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  price_per_kg: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  cod_surcharge_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
}, { tableName: 'rate_cards', underscored: true });

module.exports = RateCard;
