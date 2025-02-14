// middleware/authenticate.js
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

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or malformed token' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // e.g. { id: userId, role: 'admin' or 'user', iat, exp }
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = authenticate;