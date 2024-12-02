const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); // Adjust path if needed
const app = express();

// Apply CORS globally
// app.use(cors({
//     origin: 'https://customizable-forms-xi.vercel.app',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow only these HTTP methods
// }));

const allowedOrigins = [
    'http://localhost:3000',
    'https://customizable-forms.vercel.app', // Add production frontend URL if needed
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

app.use((req, res, next) => {
    console.log(`Incoming request from origin: ${req.headers.origin}`);
    next();
});

// Define routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));