const router = require("express").Router();
const bcrypt = require("bcrypt");
const cloudinary = require("./../config/cloudinaryConfig");
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

router.post("/", async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});
router.post("/sign-up-mobile", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      middlename,
      dateOfBirth,
      placeOfBirth,
      course,
      yearGraduated,
      presentOccupation,
      companyAddress,
      contactDetails,
      email,
      password,
      profile,
    } = req.body;
    const isExist = await User.findOne({ email });
    if (isExist) {
      return res.status(203).json({ msg: "Email Already Been Taken" });
    }
    let userObject = {
      firstname,
      lastname,
      middlename,
      dateOfBirth,
      placeOfBirth,
      course,
      yearGraduated,
      presentOccupation,
      companyAddress,
      contactDetails,
      email,
      password: await bcrypt.hash(password, 10),
      profile: { url: null, cloudinary_id: null },
    };
    if (profile) {
      try {
        const result = await cloudinary.uploader.upload(profile);
        userObject.profile.url = result.secure_url;
        userObject.profile.cloudinary_id = result.public_id;
      } catch (e) {
        return res.status(203).json({ msg: "Failed to Upload Profile Info" });
      }
    }
    const saving = new User(userObject).save();
    if (saving) {
      return res.status(200).json({ msg: "Successfully Created Sign in Now" });
    }
    return res.status(203).json({ msg: "Failed to Sign up Membership" });
  } catch (e) {
    return res.status(400).json({ msg: "Failed to signup" });
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
