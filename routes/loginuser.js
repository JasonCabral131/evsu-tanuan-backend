const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Model
const User = require("../Model/User");

// Auth
const auth = require("../middleware/auth");

// @route     GET api/loginuser
// @desc      Check if valid User
// @access    Private
router.get("/", auth, async (req, res) => {
  // console.log(req.user, "User Id");
  try {
    const user = await User.findOne({ _id: req.user }).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     POST api/user
// @desc      Login User
// @access    Private
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    // console.log(email, password);

    //  Email not found
    // Check if Admin Email Exist
    const user = await User.findOne({ email, status: "active" });
    if (!user) {
      return res.status(404).json({ msg: "Invalid User" });
    }

    // Check  Password
    //  Password does not match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        msg: "Incorrect username and password",
      });

    // Check Account Status
    if (user.accountStatus === "invalid") {
      return res.status(400).json({
        msg: "Account is still being processed please wait",
      });
    }

    const token = jwt.sign({ user: user._id }, "secret");
    return res.header("auth-token", token).status(200).json({ token, user });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server Error login" });
  }
});

module.exports = router;
