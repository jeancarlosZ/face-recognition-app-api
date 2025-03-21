const handleRegister = (req, res, bcrypt, db) => {
  const { name, email, password } = req.body;
  const saltRounds = 10;

  if (!name || name.trim() === "" || !email || email.trim() === "" || !password || password.trim() === "") {
    return res.status(400).json("Incorrect form submission");
  }
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
        .catch(err => res.status(400).json("Unable to register"));
    })
    .catch(err => res.status(400).json("Unable to register"));
}

module.exports = {
  handleRegister
};