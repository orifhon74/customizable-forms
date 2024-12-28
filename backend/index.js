// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models'); // The index of models (User, Template, Form)
const userRoutes = require('./routes/userRoutes');
const templateRoutes = require('./routes/templateRoutes');
const formRoutes = require('./routes/formRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// CORS setup
const allowedOrigins = [
    'http://localhost:3000',
    // Add your production front-end domain here if needed
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON
app.use(express.json());

// Debug logging for incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl} from origin: ${req.headers.origin}`);
    next();
});

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/forms', formRoutes);
app.use('/api', authRoutes); // login/register => /api/register, /api/login

// Sync DB and start server
const PORT = process.env.PORT || 5001;

sequelize
    .sync({ alter: true })  // set alter: true for safe schema updates, force: true for dev
    .then(() => {
        console.log('Database synced successfully');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error syncing database:', err);
    });