const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "jeancarloszhongchen",
    password: "",
    database: "face-recognition-api"
  },
});

const image = require("./controllers/image");

const app = express();
const saltRounds = 10;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send(db.users);
})

app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  db.select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then(async (data) => {
      const isValid = await bcrypt.compare(password, data[0].hash);
      if (isValid) {
        return db.select("*")
          .from("users")
          .where("email", "=", email)
          .then(user => res.json(user[0]))
          .catch(err => res.status(400).json("Unable to get user."));
      } else {
        return res.status(400).json("Wrong credentials.");
      };
    })
    .catch(err => res.status(400).json("Wrong credentials."));
})

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, saltRounds)
    .then(function (hash) {
      db.transaction(trx => {
        trx.insert({
          hash: hash,
          email: email
        })
          .into("login")
          .returning("email")
          .then(loginEmail => {
            return trx("users")
              .returning("*")
              .insert({
                name: name,
                email: loginEmail[0].email,
                joined: new Date()
              })
              .then(user => res.json(user[0]));
          })
          .then(trx.commit)
          .catch(trx.rollback);
      })
        .catch(err => res.status(400).json("If you already have an account, please sign in instead."));
    })
    .catch(err => res.status(400).json("The email and password fields need to be valid and not empty."));
})

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where("id", "=", id)
    .then(user => {
      if (user.length) {
        return res.json(user[0]);
      } else {
        return res.status(400).json("Not found.");
      };
    })
    .catch(err => res.status(400).json("Error getting user."));
})

app.put("/image", (req, res) => {
  const { id } = req.body;
  db.select("*")
    .from("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => res.json(entries[0].entries))
    .catch(err => res.status(400).json("Unable to get entries."));
})

app.post("/imageurl", (req, res) => { image.handleApiCall(req, res) })

app.listen(3000, () => {
  console.log("app is running on port 3000");
})