const { Sequelize } = require('sequelize');
require('dotenv').config();

// Support full connection string (DATABASE_URL / MYSQL_URL / DB_URI) or individual variables
const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.DB_URI;

const dbName     = (process.env.DB_NAME || '').trim();
const dbUser     = (process.env.DB_USER || '').trim();
const dbPassword = (process.env.DB_PASSWORD || '').trim();
const dbHost     = (process.env.DB_HOST || '').trim();
const dbPort     = (process.env.DB_PORT || '3306').trim();

const dialectOptions = {};
if (process.env.DB_SSL === 'true') {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
}

let sequelize;
if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'mysql',
    dialectOptions,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost || 'localhost',
    port: Number(dbPort) || 3306,
    dialect: 'mysql',
    dialectOptions,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  });
}

module.exports = { sequelize };
