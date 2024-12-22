const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

        req.user = user;
        next();
    } catch (err) {
        console.error('Authorization error:', err.message);
        res.status(403).json({ error: 'Invalid token or unauthorized access' });
    }
};

module.exports = authorizeAdmin;