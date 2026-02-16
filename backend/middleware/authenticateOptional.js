// middleware/authenticateOptional.js
'use strict';

const jwt = require('jsonwebtoken');

module.exports = function authenticateOptional(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, iat, exp }
        return next();
    } catch (err) {
        // Invalid/expired token: treat as not logged in (don’t hard fail)
        req.user = null;
        return next();
    }
};