// index.js
// require('dotenv').config();

if (process.env.NODE_ENV === 'development') {
    // Load from .env.local if it exists
    require('dotenv').config({ path: '.env.local' });
    console.log(process.env.DB_PASSWORD);
    console.log('Running in DEVELOPMENT mode - using .env.local');
} else {
    // Fallback to .env for production or other
    require('dotenv').config();
    console.log('Running in PRODUCTION mode - using .env');
}

const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models'); // The index of models (User, Template, Form)
const userRoutes = require('./routes/userRoutes');
const templateRoutes = require('./routes/templateRoutes');
const formRoutes = require('./routes/formRoutes');
const authRoutes = require('./routes/authRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const tagRoutes = require('./routes/tagRoutes');
const aggregatorRoutes = require('./routes/aggregatorRoutes');
const userSearchRoutes = require('./routes/userSearchRoutes');

const i18nMiddleware = require('./middleware/i18nMiddleware');

const app = express();

// CORS setup
const allowedOrigins = [
    'http://localhost:3000',
    'https://customizable-forms-xi.vercel.app',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            // Allow null origins (like Postman or server-side requests)
            callback(null, true);
        } else {
            console.error(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies to be sent with requests
}));

// Parse incoming JSON
app.use(express.json());

// Debug logging for incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl} from origin: ${req.headers.origin}`);
    // console.log('Headers:', req.headers); // Log all headers for debugging
    next();
});

app.use(i18nMiddleware);

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/forms', formRoutes);
app.use('/api', authRoutes); // login/register => /api/register, /api/login
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/aggregator', aggregatorRoutes);
app.use('/api/user-search', userSearchRoutes); // /api/user-search/search?query=...


// Sync DB and start server
const PORT = process.env.PORT || 5001;

sequelize
    .sync()
    .then(() => {
        console.log('Database synced successfully');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error syncing database:', err);
    });