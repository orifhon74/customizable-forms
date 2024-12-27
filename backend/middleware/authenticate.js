const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '2h' });
console.log('Generated Token:', token);

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log('Authorization Header:', authHeader); // Log the authorization header

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or malformed token' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token

    console.log('Extracted Token:', token); // Log the token

    try {
        console.log('JWT_SECRET:', process.env.JWT_SECRET); // Log the secret being used
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        console.log('Decoded Token:', decoded); // Log the decoded token
        req.user = decoded; // Attach the payload (e.g., user ID) to the request
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(403).json({ error: 'Invalid token' });
    }
};

const restrictNonAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ error: 'Authentication required' });
    }
    next();
};

module.exports = authenticate;