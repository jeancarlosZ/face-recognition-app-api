const handleLogout = (req, res) => {
  res.clearCookie("auth-token", {
    httpOnly: true,
    secure: true,
    sameSite: "None"
  });

  return res.send("Logged out");
}

module.exports = {
  handleLogout
};
