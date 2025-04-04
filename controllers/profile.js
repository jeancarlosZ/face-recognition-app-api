const handleProfileGet = (req, res, db) => {
  const { id } = req.params;

  if (id !== req.user.id) {
    return res.status(403).json({ message: "User ID does not match authenticated user" });
  }

  db.select("*")
    .from("users")
    .where("id", "=", id)
    .then(user => {
      if (user.length) {
        return res.json(user[0]);
      } else {
        return res.status(400).json({ message: "Not found" });
      };
    })
    .catch(err => res.status(400).json({ message: "Error getting user" }));
};

module.exports = {
  handleProfileGet
};
