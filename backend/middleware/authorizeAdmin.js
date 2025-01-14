// middleware/authorizeAdmin.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// require('dotenv').config();

if (process.env.NODE_ENV === 'development') {
    // Load from .env.local if it exists
    require('dotenv').config({ path: '.env.local' });
    // console.log('Running in DEVELOPMENT mode - using .env.local');
} else {
    // Fallback to .env for production or other
    require('dotenv').config();
    // console.log('Running in PRODUCTION mode - using .env');
}

const authorizeAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access only' });
        }

        req.user = user; // attach the full user to req
        next();
    } catch (err) {
        console.error('Authorization error:', err.message);
        return res.status(403).json({ error: 'Invalid token or unauthorized access' });
    }
};

module.exports = authorizeAdmin;