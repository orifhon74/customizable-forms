const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.user = decoded; // Attach decoded user data to request object
        next(); // Proceed to next middleware/route
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = authenticate;