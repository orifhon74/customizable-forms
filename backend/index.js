const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // Import Sequelize instance and models
const userRoutes = require('./routes/userRoutes'); // Adjust path if needed
const templateRoutes = require('./routes/templateRoutes'); // Adjust path if needed
const router = require('./routes/router')
const formRoutes = require('./routes/formRoutes'); // Add form routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// Apply CORS globally
const allowedOrigins = [
    'http://localhost:3000',
    'https://customizable-forms-xi.vercel.app',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON
app.use(express.json());

// Debug incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request from origin: ${req.headers.origin}`);
    next();
});

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api', authRoutes); // Auth routes (no protection)
app.use('/api/generate-token', router)
app.use('/api/forms', formRoutes); // Link the form routes

// Sync the database and start the server
const PORT = process.env.PORT || 5001;

sequelize.sync({ alter: true }) // Sync all models; use { force: true } in development if needed
    .then(() => {
        console.log('Database synced successfully');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error('Error syncing database:', err));