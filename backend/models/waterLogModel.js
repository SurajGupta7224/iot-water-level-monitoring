const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connection');

const WaterLog = sequelize.define(
  'WaterLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    water_level_percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    current_water_liters: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
    measured_distance_cm: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tank_status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'NORMAL', // e.g. LOW, NORMAL, FULL, OVERFLOW
    },
    pump_status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'OFF', // e.g. ON, OFF
    },
  },
  {
    tableName: 'water_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // water_logs table specs only has created_at
  }
);

module.exports = WaterLog;
