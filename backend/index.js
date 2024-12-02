const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes'); // Adjust path if needed
require('dotenv').config();

app.use(express.json());
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));