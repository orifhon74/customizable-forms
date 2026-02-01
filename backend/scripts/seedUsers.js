'use strict';

require('dotenv').config({ path: '.env.local', override: true });

const bcrypt = require('bcryptjs');
const sequelize = require('../db');
require('../models'); // register models
const User = require('../models/User');

async function upsertUser({ username, email, password, role }) {
    const hash = await bcrypt.hash(password, 10);

    const [user] = await User.findOrCreate({
        where: { email },
        defaults: { username, email, password: hash, role, language: 'en' },
    });

    await user.update({ role });
}

(async () => {
    try {
        await sequelize.authenticate();

        await upsertUser({
            username: 'admin',
            email: 'admin@example.com',
            password: 'Admin123!',
            role: 'admin',
        });

        await upsertUser({
            username: 'user1',
            email: 'user1@example.com',
            password: 'User123!',
            role: 'user',
        });

        console.log('✅ Seed users complete');
        process.exit(0);
    } catch (e) {
        console.error('❌ Seed users failed:', e);
        process.exit(1);
    }
})();