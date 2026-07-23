require('dotenv').config();
const app = require('./app');
const { sequelize, ensureDatabaseExists } = require('./config/connection');

// Import models to register them with Sequelize
const User = require('./models/userModel');
require('./models/settingsModel');
require('./models/waterLogModel');
require('./models/deviceStatusModel');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Create database if local
    await ensureDatabaseExists();

    // 2. Test database connection & sync models (create tables)
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database.');

    await sequelize.sync({ alter: true });
    console.log('✅ All tables (users, settings, water_logs, device_status) synced successfully.');

    // 3. Seed Admin user from environment variables if table is empty
    const userCount = await User.count();
    if (userCount === 0) {
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (adminUsername && adminPassword) {
        await User.create({
          username: adminUsername,
          password: adminPassword,
        });
        console.log(`👤 Admin user created from environment: username="${adminUsername}"`);
      }
    }

    // 4. Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
