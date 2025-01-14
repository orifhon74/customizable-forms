const { Sequelize } = require('sequelize');
// require('dotenv').config(); // Load .env variables

if (process.env.NODE_ENV === 'development') {
    // Load from .env.local if it exists
    require('dotenv').config({ path: '.env.local' });
    // console.log('Running in DEVELOPMENT mode - using .env.local');
} else {
    // Fallback to .env for production or other
    require('dotenv').config();
    // console.log('Running in PRODUCTION mode - using .env');
}

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false, // Disable SQL logging (set to true for debugging)
});

sequelize.authenticate()
    .then(() => console.log('Connected to MySQL database'))
    .catch((err) => {
        console.error('Unable to connect to the database:', err.message);
        console.error('Details:', err);
    });

module.exports = sequelize;