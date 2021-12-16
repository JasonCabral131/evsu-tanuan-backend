const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//Models
const Admin = require("../Model/Admin");

// Auth Login
const auth = require("../middleware/auth");

// @route     GET api/loginadmin
// @desc      Check if Admin is valid
// @access    Private
router.get("/", auth, async (req, res) => {
  try {
    const admin = await Admin.findOne({ _id: req.user }).select("-password");
    res.status(200).json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     POST api/loginadmin
// @desc      Logging Admin
// @access    Public
router.post("/", async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Check if Admin Email Exist
    const admin = await Admin.findOne({ userName });
    if (!admin) {
      return res
        .status(404)
        .json({ msg: "The username or password you entered is incorrect" });
    }

    // Check  Password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ msg: "The username or password you entered is incorrect" });

    const token = jwt.sign({ user: admin._id }, "secret");
    return res.header("auth-token", token).status(200).json({ token, admin });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

module.exports = router;
