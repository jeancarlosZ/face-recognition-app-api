const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");
require("dotenv").config();

const image = require("./controllers/image");
const signin = require("./controllers/signin");
const register = require("./controllers/register");
const profile = require("./controllers/profile");

const DATABASE_URL = process.env.DATABASE_URL;
const CA_CERTIFICATE = process.env.SUPABASE_CA_CERT;
const CLARIFAI_PAT = process.env.CLARIFAI_PAT;
const PORT = process.env.PORT || 3000;

if (!DATABASE_URL) {
  throw new Error('Connection string is required but not set in environment variable DATABASE_URL.');
} else if (!CA_CERTIFICATE) {
  throw new Error('CA certificate is required but not set in environment variable SUPABASE_CA_CERT.');
} else if (!CLARIFAI_PAT) {
  throw new Error('PAT for Clarifai is required but not set in environment variable CLARIFAI_PAT.');
}

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

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => { res.send(db.users) });
app.post("/signin", (req, res) => { signin.handleSignin(req, res, bcrypt, db) });
app.post("/register", (req, res) => { register.handleRegister(req, res, bcrypt, db) });
app.get("/profile/:id", (req, res) => { profile.handleProfileGet(req, res, db) });
app.put("/image", (req, res) => { image.handleImage(req, res, db) });
app.post("/imageurl", (req, res) => { image.handleApiCall(req, res, CLARIFAI_PAT) });

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
})