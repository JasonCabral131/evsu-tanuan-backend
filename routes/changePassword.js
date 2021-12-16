const mongoose = require("mongoose");
const router = require("express").Router();

// Bcrypt
const bcrypt = require("bcrypt");

// Models
const Admin = require("../Model/Admin");

// @route     PUT api/changePassword
// @desc      Update Password
// @access    Private
router.put("/:id", async (req, res) => {
  const { userName, email, phoneNumber, oldPassword, password } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(500).json({ msg: "No admin found" });
    const admin = await Admin.findOne({ _id: req.params.id });
    // Check password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Incorrect old password!" });
    // Success

    // Hashing Password
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedAdmin = await Admin.updateOne(
      { _id: req.params.id },
      {
        $set: {
          userName,
          email,
          phoneNumber,
          password: hashedPassword,
        },
      }
    );
    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
