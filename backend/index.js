// index.js

if (process.env.NODE_ENV === "development") {
    require("dotenv").config({ path: ".env.local" });
    console.log("Running in DEVELOPMENT mode - using .env.local");
} else {
    require("dotenv").config();
    console.log("Running in PRODUCTION mode - using .env");
}

const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");

const userRoutes = require("./routes/userRoutes");
const templateRoutes = require("./routes/templateRoutes");
const formRoutes = require("./routes/formRoutes");
const authRoutes = require("./routes/authRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");
const tagRoutes = require("./routes/tagRoutes");
const aggregatorRoutes = require("./routes/aggregatorRoutes");
const userSearchRoutes = require("./routes/userSearchRoutes");

const i18nMiddleware = require("./middleware/i18nMiddleware");

const app = express();

// CORS setup
const allowedOrigins = [
    "http://localhost:3000",
    "https://customizable-forms-xi.vercel.app",
];

app.get("/health", (_, res) => {
    res.status(200).json({ ok: true });
});

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.error(`Blocked by CORS: ${origin}`);
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// Parse incoming JSON
app.use(express.json());

// Debug logging for incoming requests
app.use((req, res, next) => {
    console.log(
        `Incoming request: ${req.method} ${req.originalUrl} from origin: ${req.headers.origin}`
    );
    next();
});

app.use(i18nMiddleware);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/forms", formRoutes);
app.use("/api", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/aggregator", aggregatorRoutes);
app.use("/api/user-search", userSearchRoutes);

// Sync DB and start server
const PORT = process.env.PORT || 5001;

app.use((req, res, next) => {
    res.setHeader("Vary", "Origin");
    next();
});

const syncOptions =
    process.env.NODE_ENV === "development"
        ? { alter: true } // ✅ auto-update schema in dev
        : {}; // ✅ don't auto-alter in prod

sequelize
    .sync(syncOptions)
    .then(() => {
        console.log("Database synced successfully", syncOptions);
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error syncing database:", err);
    });