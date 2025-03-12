const express = require("express");
const bcrypt = require("bcrypt");

const app = express();
const saltRounds = 10;

app.use(express.json());

let idCount = 1;
const mockDatabase = {
  users: []
}

app.get("/", (req, res) => {
  res.send(mockDatabase.users);
})

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  for (let i = 0; i < mockDatabase.users.length; i++) {
    const user = mockDatabase.users[i];
    if (email === user.email) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        return res.json("Success");
      };
    };
  };
  res.status(400).json("error loggin in");
})

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  mockDatabase.users.push({
    id: idCount++,
    name: name,
    email: email,
    password: password,
    entries: 0,
    joined: new Date()
  })
  const user = mockDatabase.users[mockDatabase.users.length - 1];
  bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
      console.log(err);
    } else {
      user.password = hash;
      console.log(user);
    };
  });
  res.json(user);
})

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  let found = false;
  mockDatabase.users.forEach(user => {
    if (String(user.id) === id) {
      found = true;
      return res.json(user);
    };
  })
  if (!found) {
    res.status(400).json("no such user");
  };
})

app.put("/image", (req, res) => {
  const { id } = req.body;
  let found = false;
  mockDatabase.users.forEach(user => {
    if (String(user.id) === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    };
  })
  if (!found) {
    res.status(400).json("no such user");
  };
})

app.listen(3000, () => {
  console.log("app is running on port 3000");
})