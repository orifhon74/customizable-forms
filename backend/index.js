const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // Import Sequelize instance
const userRoutes = require('./routes/userRoutes'); // User routes
const templateRoutes = require('./routes/templateRoutes'); // Template routes
const formRoutes = require('./routes/formRoutes'); // Form routes
const authRoutes = require('./routes/authRoutes'); // Auth routes
const tokenRouter = require('./routes/router'); // Token generation route (rename if needed)

const app = express();

// Apply CORS globally
const allowedOrigins = [
    'http://localhost:3000', // Local development
    'https://customizable-forms-xi.vercel.app', // Deployed frontend
];

app.use(
    cors({
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
    })
);

// Parse incoming JSON requests
app.use(express.json());

// Debug incoming requests for development
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl} from origin: ${req.headers.origin}`);
    next();
});

// Define routes
app.use('/api/users', userRoutes); // User routes
app.use('/api/templates', templateRoutes); // Template routes
app.use('/api/forms', formRoutes); // Form routes
app.use('/api', authRoutes); // Authentication routes
app.use('/api/generate-token', tokenRouter); // Token generation route

// Sync the database and start the server
const PORT = process.env.PORT || 5001;

sequelize
    .sync({ alter: true }) // Use alter: true for safe schema updates. Use force: true ONLY for development/testing.
    .then(() => {
        console.log('Database synced successfully');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error syncing database:', err);
    });