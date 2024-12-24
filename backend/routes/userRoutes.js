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
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
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
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.deletedAt) {
            await user.restore();
        } else {
            await user.destroy();
        }

        res.json({ message: 'User blocked/unblocked successfully' });
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

        await user.destroy({ force: true });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const authorizeAdmin = require('../middleware/authorizeAdmin');
//
// // Get all users (Admins only)
// router.get('/users', authorizeAdmin, async (req, res) => {
//     try {
//         const users = await User.findAll();
//         res.json(users);
//     } catch (err) {
//         console.error('Error fetching users:', err);
//         res.status(500).json({ error: 'Failed to fetch users' });
//     }
// });
//
// // Block or unblock a user (Admins only)
// router.put('/:id/block', authorizeAdmin, async (req, res) => {
//     try {
//         const { id } = req.params;
//         const user = await User.findByPk(id);
//
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//
//         user.isBlocked = !user.isBlocked; // Toggle the block status
//         await user.save();
//
//         res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user });
//     } catch (err) {
//         console.error('Error blocking/unblocking user:', err);
//         res.status(500).json({ error: 'Failed to block/unblock user' });
//     }
// });
//
// router.delete('/:id', authorizeAdmin, async (req, res) => {
//     try {
//         const { id } = req.params;
//         const user = await User.findByPk(id);
//
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//
//         await user.destroy();
//         res.json({ message: 'User deleted successfully' });
//     } catch (err) {
//         console.error('Error deleting user:', err);
//         res.status(500).json({ error: 'Failed to delete user' });
//     }
// });
//
// // Promote or demote an admin (Admins only)
// router.put('/:id/role', authorizeAdmin, async (req, res) => {
//     try {
//         const { id } = req.params;
//         const user = await User.findByPk(id);
//
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//
//         // Toggle role between 'user' and 'admin'
//         user.role = user.role === 'admin' ? 'user' : 'admin';
//         await user.save();
//
//         res.json({ message: `User role updated to ${user.role}`, user });
//     } catch (err) {
//         console.error('Error updating user role:', err);
//         res.status(500).json({ error: 'Failed to update user role' });
//     }
// });
//
// module.exports = router;