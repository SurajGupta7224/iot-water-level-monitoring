const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connection');

const DeviceStatus = sequelize.define(
  'DeviceStatus',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    device_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Water Level Monitor Node',
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    device_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'OFFLINE', // e.g. ONLINE, OFFLINE
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wifi_signal_strength: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    firmware_version: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '1.0.0',
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'device_status',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = DeviceStatus;
