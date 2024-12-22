const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Get all users (Admins only)
router.get('/users', authorizeAdmin, async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Block or unblock a user (Admins only)
router.patch('/users/:id/block', authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isBlocked = !user.isBlocked; // Toggle block/unblock
        await user.save();

        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user });
    } catch (err) {
        console.error('Error blocking/unblocking user:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Promote or demote an admin (Admins only)
router.patch('/users/:id/role', authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (role !== 'admin' && role !== 'user') {
            return res.status(400).json({ error: 'Invalid role' });
        }

        user.role = role;
        await user.save();

        res.json({ message: `User role updated to ${role}`, user });
    } catch (err) {
        console.error('Error updating user role:', err);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

module.exports = router;