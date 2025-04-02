const { generateJWT, encryptJWT } = require("../utils/jwtUtils");

const handleSignin = (req, res, bcrypt, db) => {
  const { email, password } = req.body;

  if (!email || email.trim() === "" || !password || password.trim() === "") {
    return res.status(400).json({ message: "Fields cannot be empty" });
  }

  db.select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then(async (data) => {
      const isValid = await bcrypt.compare(password, data[0].hash);
      if (isValid) {
        return db.select("*")
          .from("users")
          .where("email", "=", email)
          .then(async (userArr) => {
            try {
              const user = userArr[0];
              const token = await generateJWT({ userId: user.id });
              const encryptedToken = await encryptJWT({ token });

              res.cookie("auth-token", encryptedToken, {
                httpOnly: true, // Prevent access via JavaScript
                secure: true, // Use secure cookies
                sameSite: "Strict", // Prevent cross-site requests
                maxAge: 60 * 60 * 1000 // 1 hour expiration
              });

              return res.json({ user });
            } catch (err) {
              return res.status(500).json({ message: "Error signing or encrypting JWT" });
            }
          })
          .catch(err => res.status(400).json({ message: "Unable to get user" }));
      } else {
        return res.status(401).json({ message: "Wrong credentials" });
      };
    })
    .catch(err => res.status(401).json({ message: "Wrong credentials" }));
}

module.exports = {
  handleSignin
};
