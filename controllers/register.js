const { generateJWT, encryptJWT } = require("../utils/jwtUtils");

const handleRegister = (req, res, bcrypt, db) => {
  const { name, email, password } = req.body;
  const saltRounds = 10;

  if (!name || name.trim() === "" || !email || email.trim() === "" || !password || password.trim() === "") {
    return res.status(400).json({ message: "Fields cannot be empty" });
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
              .then(async (userArr) => {
                try {
                  const user = userArr[0];
                  const token = await generateJWT({ userId: user.id });
                  const encryptedToken = await encryptJWT({ token });

                  return res.json({
                    encryptedToken,
                    user
                  });
                } catch (err) {
                  return res.status(500).json({ message: "Error signing or encrypting JWT" });
                }
              })
              .catch(err => res.status(400).json({ message: "Unable to register" }));
          })
          .then(trx.commit)
          .catch(trx.rollback);
      })
        .catch(err => res.status(400).json({ message: "Unable to register" }));
    })
    .catch(err => res.status(400).json({ message: "Unable to register" }));
}

module.exports = {
  handleRegister
};