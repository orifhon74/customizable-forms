const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Temporary route to generate a valid JWT
router.get('/', (req, res) => {
    // Replace `1` with the actual user ID or payload
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

module.exports = router;