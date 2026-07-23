const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connection');

const Settings = sequelize.define(
  'Settings',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tank_height_cm: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 100.0,
    },
    tank_capacity_liters: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 1000.0,
    },
    minimum_water_level_percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 20.0,
    },
    maximum_water_level_percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 90.0,
    },
    auto_pump: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    wifi_ssid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wifi_password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Settings;
