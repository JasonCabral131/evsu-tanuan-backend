const router = require("express").Router();
const bcrypt = require("bcrypt");

//Models
const User = require("../Model/User");

// @route     GET api/user
// @desc      FETCH User
// @access    Private
router.get("/", async (req, res) => {
  try {
    const users = await User.find().populate("course", "courseName").sort({
      date: -1,
    });
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     POST api/user
// @desc      Create User Account
// @access    Private
router.post("/", async (req, res) => {
  const {
    name,
    middleName,
    lastName,
    email,
    password,
    accountStatus,
    phoneNumber,
    age,
    sex,
    batch,
    course,
    status,
    currentWork,
    monthlyIncome,
    yearlyIncome,
    jobExperience,
    image,
  } = req.body;

  const user = await User.findOne({ name, middleName, lastName });
  if (user)
    return res.status(400).json({ msg: "User already answered the survey" });

  const emailExist = await User.findOne({ email });
  if (emailExist)
    return res.status(400).json({ msg: "Email is already taken" });

  // Hashing Password
  const salt = 10;
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const newUser = new User({
      name,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      accountStatus,
      phoneNumber,
      age,
      sex,
      batch,
      course,
      status,
      currentWork,
      jobExperience,
      monthlyIncome,
      yearlyIncome,
      image,
    });
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     PUT api/user/:id
// @desc      Update User Account
// @access    Private
router.put("/:id", async (req, res) => {
  const {
    name,
    middleName,
    lastName,
    email,
    phoneNumber,
    age,
    sex,
    batch,
    course,
    status,
    currentWork,
    monthlyIncome,
    yearlyIncome,
    jobExperience,
  } = req.body;
  try {
    const updatedUser = await User.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name,
          middleName,
          lastName,
          email,
          phoneNumber,
          age,
          sex,
          batch,
          course,
          status,
          currentWork,
          monthlyIncome,
          yearlyIncome,
          jobExperience,
        },
      }
    );
    res.status(200).json({ msg: "Update Success fully", updatedUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     Delete api/user/:id
// @desc      Delete User Account
// @access    Private
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ msg: "Delete Success fully", deletedUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

module.exports = router;
