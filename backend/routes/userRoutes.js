// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

/**
 * GET /api/users
 * - Admin-only: fetch all users (including soft-deleted)
 */
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt', 'deletedAt'],
            paranoid: false, // include soft-deleted
        });
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * PUT /api/users/:id/role
 * - Admin-only: update a user's role
 */
router.put('/:id/role', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const { id } = req.params;

        const user = await User.findByPk(id, { paranoid: false });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Allow admins to demote themselves
        if (req.user.id === parseInt(id) && role === 'user') {
            await user.update({ role });
            return res.json({ message: 'Role updated successfully (self-demotion)' });
        }

        // Prevent demotion if there's only one admin left
        const adminCount = await User.count({ where: { role: 'admin' } });
        if (user.role === 'admin' && role === 'user' && adminCount === 1) {
            return res.status(403).json({ error: 'Cannot demote the only admin' });
        }

        await user.update({ role });
        res.json({ message: 'Role updated successfully' });
    } catch (err) {
        console.error('Error updating role:', err);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

/**
 * PUT /api/users/:id/block
 * - Admin-only: block/unblock user (soft delete / restore)
 */
router.put('/:id/block', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { paranoid: false });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.deletedAt) {
            // If already soft-deleted => restore
            await user.restore();
            return res.json({ message: 'User unblocked successfully' });
        } else {
            // Soft-delete => block
            await user.destroy();
            return res.json({ message: 'User blocked successfully' });
        }
    } catch (err) {
        console.error('Error blocking/unblocking user:', err);
        res.status(500).json({ error: 'Failed to block/unblock user' });
    }
});

/**
 * DELETE /api/users/:id
 * - Admin-only: permanently delete a user
 */
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hard delete
        await user.destroy({ force: true });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;