const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbName     = process.env.DB_NAME;
const dbUser     = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost     = process.env.DB_HOST;
const dbPort     = process.env.DB_PORT || 3306;

// Helper to ensure database exists before Sequelize connects (only for local MySQL)
async function ensureDatabaseExists() {
  const isLocal = dbHost === 'localhost' || dbHost === '127.0.0.1';
  if (!isLocal) {
    console.log('ℹ️ Remote cloud database detected. Skipping root CREATE DATABASE check.');
    return;
  }

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
    });
    if (dbName) {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    }
    await connection.end();
    console.log(`✅ Local database '${dbName}' verified/created successfully.`);
  } catch (err) {
    console.warn('⚠️ Warning checking/creating database:', err.message);
  }
}

const dialectOptions = {};
if (process.env.DB_SSL === 'true') {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  dialectOptions,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = { sequelize, ensureDatabaseExists };
