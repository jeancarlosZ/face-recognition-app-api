const handleLogout = (req, res) => {
  res.clearCookie("auth-token");

  return res.send("Logged out");
}

module.exports = {
  handleLogout
};
