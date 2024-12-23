const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Get all users (Admin-only)
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt', 'deletedAt'],
            paranoid: false, // Include soft-deleted users
        });
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user role (Admin-only)
router.put('/:id/role', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.update({ role });
        res.json({ message: 'User role updated successfully', user });
    } catch (err) {
        console.error('Error updating user role:', err);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// Block/Unblock user (Admin-only)
router.put('/:id/block', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Soft delete to block; restore to unblock
        if (user.deletedAt) {
            await user.restore();
            res.json({ message: 'User unblocked successfully' });
        } else {
            await user.destroy();
            res.json({ message: 'User blocked successfully' });
        }
    } catch (err) {
        console.error('Error blocking/unblocking user:', err);
        res.status(500).json({ error: 'Failed to block/unblock user' });
    }
});

// Delete user (Admin-only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.destroy({ force: true }); // Permanently delete the user
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;