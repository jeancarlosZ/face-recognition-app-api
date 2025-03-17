const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");
require("dotenv").config();

const image = require("./controllers/image");
const signin = require("./controllers/signin");
const register = require("./controllers/register");
const profile = require("./controllers/profile");

const PORT = process.env.PORT;

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "",
    password: "",
    database: "face-recognition-api"
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
app.post("/imageurl", (req, res) => { image.handleApiCall(req, res) });

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
})