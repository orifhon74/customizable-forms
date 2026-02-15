'use strict';

// Load env first (avoid weird terminal env overrides)
// require('dotenv').config({ path: '.env.local', override: true });
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '.env.local' });
}

const sequelize = require('../db');

// IMPORTANT: this must import all models + associations
require('../models'); // this should be backend/models/index.js

(async () => {
    try {
        await sequelize.authenticate();

        // Drop and recreate all tables for ALL loaded models
        await sequelize.sync({ force: true });

        console.log('✅ DB reset complete (force sync)');
        process.exit(0);
    } catch (err) {
        console.error('❌ DB reset failed:', err);
        process.exit(1);
    }
})();