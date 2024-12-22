const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

/**
 * POST /api/register - Register a new user
 */
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        console.log('Register request received:', req.body); // Log request body

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user', // Default role
        });

        console.log('User registered successfully:', newUser); // Log new user

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (err) {
        console.error('Error during registration:', err.message); // Log error details
        res.status(500).json({ error: 'Failed to register', details: err.message });
    }
});

/**
 * POST /api/login - Authenticate user and return a JWT
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login request received:', req.body); // Log request body

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login successful for user:', user.username);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Error during login:', err.message); // Log error details
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;