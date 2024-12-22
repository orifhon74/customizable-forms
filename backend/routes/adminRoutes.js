const express = require('express');
const router = express.Router();
const authorizeAdmin = require('../middleware/authorizeAdmin');
const User = require('../models/User');

// Admin: Get all users
router.get('/users', authorizeAdmin, async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// Admin: Block a user
router.put('/block/:id', authorizeAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.role = 'blocked';
        await user.save();
        res.json({ message: 'User blocked successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to block user', details: error.message });
    }
});

// Admin: Make a user admin
router.put('/make-admin/:id', authorizeAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.role = 'admin';
        await user.save();
        res.json({ message: 'User is now an admin', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role', details: error.message });
    }
});

module.exports = router;