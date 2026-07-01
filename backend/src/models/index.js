const sequelize = require('../config/database');
const User = require('./User');
const Zone = require('./Zone');
const ZoneArea = require('./ZoneArea');
const RateCard = require('./RateCard');
const Order = require('./Order');
const TrackingHistory = require('./TrackingHistory');
const Notification = require('./Notification');

// Zone & ZoneArea
Zone.hasMany(ZoneArea, { foreignKey: 'zone_id', as: 'areas', onDelete: 'CASCADE' });
ZoneArea.belongsTo(Zone, { foreignKey: 'zone_id', as: 'zone' });

// Zone & RateCard (from/to zones)
Zone.hasMany(RateCard, { foreignKey: 'from_zone_id', as: 'outgoingRates', onDelete: 'CASCADE' });
Zone.hasMany(RateCard, { foreignKey: 'to_zone_id', as: 'incomingRates', onDelete: 'CASCADE' });
RateCard.belongsTo(Zone, { foreignKey: 'from_zone_id', as: 'fromZone' });
RateCard.belongsTo(Zone, { foreignKey: 'to_zone_id', as: 'toZone' });

// User & Zone
User.belongsTo(Zone, { foreignKey: 'zone_id', as: 'zone' });
Zone.hasMany(User, { foreignKey: 'zone_id', as: 'users' });

// Order associations
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Order.belongsTo(User, { foreignKey: 'agent_id', as: 'agent' });
Order.belongsTo(Zone, { foreignKey: 'pickup_zone_id', as: 'pickupZone' });
Order.belongsTo(Zone, { foreignKey: 'drop_zone_id', as: 'dropZone' });

User.hasMany(Order, { foreignKey: 'customer_id', as: 'customerOrders' });
User.hasMany(Order, { foreignKey: 'agent_id', as: 'agentOrders' });

Order.hasMany(TrackingHistory, { foreignKey: 'order_id', as: 'trackingHistory', onDelete: 'CASCADE' });
TrackingHistory.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasMany(Notification, { foreignKey: 'order_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Zone,
  ZoneArea,
  RateCard,
  Order,
  TrackingHistory,
  Notification
};
