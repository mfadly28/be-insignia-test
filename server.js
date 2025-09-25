// server.js
require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');
const User = require('./models/user'); // ensure model loaded

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    // WARNING: alter:false to avoid dropping columns; sync creates table if not exist
    await sequelize.sync({ alter: true }); // alter:true will attempt to update schema safely
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to connect to DB:', err);
    process.exit(1);
  }
})();
