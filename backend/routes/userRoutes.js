const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Get all users
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt', 'deletedAt'],
            paranoid: false,
        });
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user role
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

        // Prevent demotion of head_admin
        if (user.role === 'head_admin') {
            return res.status(403).json({ error: 'Cannot demote the head admin' });
        }

        // Prevent demotion of self
        if (user.id === req.user.id && req.user.role === 'admin') {
            return res.status(403).json({ error: 'Admins cannot demote themselves' });
        }

        await user.update({ role });
        res.json({ message: 'Role updated successfully' });
    } catch (err) {
        console.error('Error updating role:', err);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// Block/Unblock user
router.put('/:id/block', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { paranoid: false }); // Include soft-deleted users

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.deletedAt) {
            await user.restore(); // Unblock user
            res.json({ message: 'User unblocked successfully' });
        } else {
            await user.destroy(); // Block user
            res.json({ message: 'User blocked successfully' });
        }
    } catch (err) {
        console.error('Error blocking/unblocking user:', err);
        res.status(500).json({ error: 'Failed to block/unblock user' });
    }
});

// Delete user
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent deleting other admins or self
        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Admins cannot delete other admins' });
        }

        if (user.id === req.user.id) {
            return res.status(403).json({ error: 'You cannot delete your own account' });
        }

        await user.destroy({ force: true }); // Hard delete the user
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;