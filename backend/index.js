// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');
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

const allowedOrigins = [
    'http://localhost:3000',
    'https://your-frontend.domain',
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

app.use(express.json());

// Logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} from origin: ${req.headers.origin || 'unknown'}`);
    next();
});

// Optional: i18n middleware (reads req.user.language or Accept-Language)
app.use(i18nMiddleware);

// Routes
app.use('/api/users', userRoutes);       // user mgmt
app.use('/api/templates', templateRoutes);
app.use('/api/forms', formRoutes);
app.use('/api', authRoutes);            // /api/register, /api/login
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/aggregator', aggregatorRoutes);
app.use('/api/user-search', userSearchRoutes); // /api/user-search/search?query=...

// Sync DB and start
const PORT = process.env.PORT || 5001;
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced');
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch((err) => console.error('DB sync error:', err));