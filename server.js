const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");
require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const { generateSecretEncryptionKeys } = require("./utils/jwtUtils");
const image = require("./controllers/image");
const signin = require("./controllers/signin");
const register = require("./controllers/register");
const profile = require("./controllers/profile");
const authMiddleware = require("./middlewares/authMiddleware");

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const CA_CERTIFICATE = process.env.SUPABASE_CA_CERT;
const CLARIFAI_PAT = process.env.CLARIFAI_PAT;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_ENCRYPTION_KEY = process.env.JWT_ENCRYPTION_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;
const COOKIE_SECRET_KEY = process.env.COOKIE_SECRET_KEY;
const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY;
const SESSION_SECRET_KEY_BUFFER = Buffer.from(SESSION_SECRET_KEY, "base64");

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
} else if (!COOKIE_SECRET_KEY) {
  throw new Error("Cookie secret key is required but not set in environment variable COOKIE_SECRET_KEY.");
} else if (!SESSION_SECRET_KEY) {
  throw new Error("Session secret key is required but not set in environment variable SESSION_SECRET_KEY.");
}

/*
// Generate secret and encryption keys to be stored in environment variables
generateSecretEncryptionKeys();
*/

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

const corsOptions = {
  origin: FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true
};

const app = express();

app.use(helmet()); // Help secure Express apps by setting HTTP response headers
app.use(morgan("combined")); // Log request details to monitor for suspicious activity
app.use(express.json()); // Middleware to parse JSON requests
app.use(cors(corsOptions));
app.use(cookieParser(COOKIE_SECRET_KEY));

app.use(session({
  secret: SESSION_SECRET_KEY_BUFFER,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production", // Set secure cookies in production
    httpOnly: true, // Protect cookie from client-side access
    maxAge: 60 * 60 * 1000, // 1 hour expiration
    sameSite: "Strict" // CSRF protection
  }
}));

app.get("/", (req, res) => { res.send("Server Online") });
app.post("/signin", (req, res) => { signin.handleSignin(req, res, bcrypt, db) });
app.post("/register", (req, res) => { register.handleRegister(req, res, bcrypt, db) });
app.get("/profile/:id", authMiddleware, (req, res) => { profile.handleProfileGet(req, res, db) });
app.put("/image", authMiddleware, (req, res) => { image.handleImage(req, res, db) });
app.post("/imageurl", authMiddleware, (req, res) => { image.handleApiCall(req, res) });
app.post("/check-image", authMiddleware, (req, res) => { image.checkIfImage(req, res) });

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
})