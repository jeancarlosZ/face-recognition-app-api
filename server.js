const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");
require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const { generateSecretEncryptionKeys } = require("./utils/jwtUtils");
const image = require("./controllers/image");
const signin = require("./controllers/signin");
const register = require("./controllers/register");
const profile = require("./controllers/profile");
const logout = require("./controllers/logout");
const authMiddleware = require("./middlewares/authMiddleware");
const { validateImageUrl, validateImageCount } = require("./validators/imageValidator");
const { validateRegistration, validateLogin, validateUserProfile } = require("./validators/userValidator");

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const CA_CERTIFICATE = process.env.SUPABASE_CA_CERT;
const CLARIFAI_PAT = process.env.CLARIFAI_PAT;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_ENCRYPTION_KEY = process.env.JWT_ENCRYPTION_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!DATABASE_URL) {
  throw new Error("Connection string is required but not set in environment variable DATABASE_URL.");
} else if (!CA_CERTIFICATE) {
  throw new Error("CA certificate is required but not set in environment variable SUPABASE_CA_CERT.");
} else if (!CLARIFAI_PAT) {
  throw new Error("PAT for Clarifai is required but not set in environment variable CLARIFAI_PAT.");
} else if (!JWT_SECRET_KEY) {
  throw new Error("JWT secret key is required but not set in environment variable JWT_SECRET_KEY.");
} else if (!JWT_ENCRYPTION_KEY) {
  throw new Error("JWT encryption key is required but not set in environment variable JWT_ENCRYPTION_KEY.");
} else if (!FRONTEND_URL) {
  throw new Error("Frontend URL is required but not set in environment variable FRONTEND_URL.");
}

/*
// Generate secret and encryption keys to be stored in environment variables
generateSecretEncryptionKeys();
*/

const corsOptions = {
  origin: FRONTEND_URL, // Allowed URL for making requests to the server
  credentials: true // Allow cookies in requests
};

const app = express();

const db = knex({
  client: "pg",
  connection: {
    // Supabase Database
    connectionString: DATABASE_URL,
    ssl: { ca: CA_CERTIFICATE },

    /* 
    // Local Database
    host: "127.0.0.1",
    port: 5432,
    user: "",
    password: "",
    database: "face-recognition-api"
     */
  },
});

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: "draft-8", // draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(cors(corsOptions));
app.use(helmet()); // Help secure Express apps by setting HTTP response headers
app.use(express.json()); // Middleware to parse JSON requests
app.use(cookieParser()); // Handle cookie-based data in requests and responses
app.use("/imageurl", limiter);
app.use(morgan("combined")); // Log request details to monitor for suspicious activity

app.get("/", (req, res) => { res.send("Server Online") });
app.post("/signin", validateLogin, (req, res) => { signin.handleSignin(req, res, bcrypt, db) });
app.post("/register", validateRegistration, (req, res) => { register.handleRegister(req, res, bcrypt, db) });
app.get("/profile/:id", authMiddleware, validateUserProfile, (req, res) => { profile.handleProfileGet(req, res, db) });
app.put("/image", authMiddleware, validateImageCount, (req, res) => { image.handleImage(req, res, db) });
app.post("/imageurl", authMiddleware, validateImageUrl, (req, res) => { image.handleApiCall(req, res) });
app.post("/check-image", authMiddleware, validateImageUrl, (req, res) => { image.checkIfImage(req, res) });
app.post("/logout", (req, res) => { logout.handleLogout(req, res) });

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
