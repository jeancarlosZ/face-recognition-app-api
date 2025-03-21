const handleProfileGet = (req, res, db) => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    return res.status(400).json("Id cannot be empty");
  }

  db.select("*")
    .from("users")
    .where("id", "=", id)
    .then(user => {
      if (user.length) {
        return res.json(user[0]);
      } else {
        return res.status(400).json("Not found");
      };
    })
    .catch(err => res.status(400).json("Error getting user"));
}

module.exports = {
  handleProfileGet
};