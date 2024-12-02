const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load .env variables

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