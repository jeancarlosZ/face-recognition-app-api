const { generateJWT, encryptJWT } = require("../utils/jwtUtils");

const handleRegister = (req, res, bcrypt, db) => {
  const { name, email, password } = req.body;
  const saltRounds = 10;

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

                  res.cookie("auth-token", encryptedToken, {
                    httpOnly: true, // Prevent access via JavaScript
                    secure: true, // Use secure cookies
                    sameSite: "None", // Prevent cross-site requests
                    maxAge: 60 * 60 * 1000 // 1 hour expiration
                  });

                  return res.json({ user });
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
};

module.exports = {
  handleRegister
};
