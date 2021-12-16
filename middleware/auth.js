const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) return res.status(401).json({ msg: "Error no token" });

  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded.user;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ msg: "Token not valid" });
  }
};

module.exports = auth;
