const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Models
const Admin = require("../Model/Admin");

// @route     GET api/admin
// @desc      Fetch Admin
// @access    Private
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     POST api/admin
// @desc      Create Admin
// @access    Private
router.post("/", async (req, res) => {
  const { userName, email, phoneNumber, password } = req.body;

  // Check if Admin Email is already taken
  const adminUsername = await Admin.findOne({ userName });
  if (adminUsername)
    return res.status(400).json({ msg: "Username is already taken" });

  const admin = await Admin.findOne({ email });
  if (admin) return res.status(400).json({ msg: "Email is already taken" });

  // Hashing Password
  const salt = 10;
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const newAdmin = new Admin({
      userName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    const admin = await newAdmin.save();

    // ? Gin comment ko kay waray man inen gamit
    // const token = jwt.sign({ user: admin._id }, "secret");
    // res.header("auth-token", token).status(200).json({ token, admin });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedAdmin = await Admin.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedAdmin);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

module.exports = router;
