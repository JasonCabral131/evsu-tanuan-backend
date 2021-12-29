const router = require("express").Router();
const bcrypt = require("bcrypt");
const cloudinary = require("./../config/cloudinaryConfig");
const auth = require("./../middleware/auth");
//Models
const User = require("../Model/User");
const { imageUpload } = require("./../middleware/common-middleware");
const Notify = require("./../Model/notifier");
const Job = require("./../Model/Job");
const JobApply = require("./../Model/JobApply");
const Event = require("./..//Model/Event");
const NotifyUser = require("./../Model/notify-users");
// @route     GET api/user
// @desc      FETCH User
// @access    Private
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ status: "active" })
      .populate("course", "courseName")
      .sort({
        date: -1,
      });
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});
router.get("/pending-user", async (req, res) => {
  try {
    const users = await User.find({ status: "pending" })
      .populate("course", "courseName")
      .sort({
        date: -1,
      });
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});
router.get("/archived-user", async (req, res) => {
  try {
    const users = await User.find({ status: "archived" })
      .populate("course", "courseName")
      .sort({
        date: -1,
      });
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});
router.get("/banned-user", async (req, res) => {
  try {
    const users = await User.find({ status: "banned" })
      .populate("course", "courseName")
      .sort({
        date: -1,
      });
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});
router.post(
  "/sign-up-web",
  imageUpload.fields([{ name: "profile" }]),
  async (req, res) => {
    try {
      const {
        firstname,
        lastname,
        middlename,
        dateOfBirth,
        placeOfBirth,
        course,
        sex,
        yearGraduated,
        presentOccupation,
        companyAddress,
        phone,
        address,
        email,
        password,
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
        sex,
        yearGraduated,
        presentOccupation,
        companyAddress,
        phone,
        address,
        email,
        password: await bcrypt.hash(password, 10),
        profile: { url: null, cloudinary_id: null },
      };
      if (req.files.profile) {
        if (req.files.profile.length > 0) {
          const result = await cloudinary.uploader.upload(
            req.files.profile[0].path
          );
          userObject.profile.url = result.secure_url;
          userObject.profile.cloudinary_id = result.public_id;
        }
      }

      const saving = await new User(userObject).save();
      if (saving) {
        const savingNotify = await new Notify({
          link: `/new-user-sign-up/${saving._id}`,
          message: `New User has been sign up!, Check the information for approval => <Link>${
            saving.firstname + " " + saving.lastname
          }</Link`,
          profile: `${saving.profile.url}`,
        }).save();
        return res
          .status(200)
          .json({ msg: "Successfully Created Sign in Now", savingNotify });
      }
      return res.status(203).json({ msg: "Failed to Sign up Membership" });
    } catch (e) {
      return res.status(400).json({ msg: "Failed to signup" });
    }
  }
);
router.get("/get-user-information/:id", async (req, res) => {
  try {
    const info = await User.findOne({ _id: req.params.id })
      .populate("course", "courseName")
      .lean();
    if (info) {
      return res.status(200).json(info);
    } else {
      return res.status(400).json({ msg: "failed to get User Information" });
    }
  } catch (e) {
    return res.status(400).json({ msg: "failed to get User Information" });
  }
});
router.post("/sign-up-mobile", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      middlename,
      sex,
      dateOfBirth,
      placeOfBirth,
      course,
      yearGraduated,
      presentOccupation,
      companyAddress,
      phone,
      address,
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
      phone,
      address,
      email,
      sex,
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
    const saving = await new User(userObject).save();
    if (saving) {
      return res.status(200).json({ msg: "Successfully Created Sign in Now" });
    }
    return res.status(203).json({ msg: "Failed to Sign up Membership" });
  } catch (e) {
    return res.status(400).json({ msg: "Failed to signup" });
  }
});

router.post("/update-status-user", async (req, res) => {
  try {
    const { userId, status } = req.body;
    const isExist = await User.findOne({ _id: userId }).lean();
    if (isExist) {
      const updating = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { status: "active" } }
      );
      if (updating) {
        return res.status(200).json({ msg: "Successfully Updated Status" });
      }
      return res.status(400).json({ msg: "Failed to Update" });
    } else {
      return res.status(400).json({ msg: "Failed to Update" });
    }
  } catch (e) {
    return res.status(400).json({ msg: "Failed to Update" });
  }
});
router.post("/deleting-pending-request", async (req, res) => {
  try {
    const { userId, cloudinary_id } = req.body;
    const isActive = await User.findOne({
      _id: userId,
      status: { $ne: "pending" },
    }).lean();
    if (isActive) {
      return res.status(400).json({ msg: "User Status is not Pending" });
    }

    const deletedUser = await User.deleteOne({ _id: userId });
    if (deletedUser) {
      await cloudinary.uploader.destroy(cloudinary_id);
      return res.status(200).json({ msg: "Delete Success fully", deletedUser });
    }
    return res.status(400).json({ msg: "Failed to delete" });
  } catch (e) {
    return res.status(500).json({ msg: "Failed to Delete" });
  }
});
// @route     PUT api/user/:id
// @desc      Update User Account
// @access    Private
router.put("/:id", async (req, res) => {
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
    phone,
    address,
    email,
    sex,
  } = req.body;
  try {
    const updatedUser = await User.updateOne(
      { _id: req.params.id },
      {
        $set: {
          firstname,
          lastname,
          middlename,
          dateOfBirth,
          placeOfBirth,
          course,
          yearGraduated,
          presentOccupation,
          companyAddress,
          phone,
          address,
          email,
          sex,
        },
      }
    );
    res.status(200).json({ msg: "Update Success fully", updatedUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});
router.post("/get-job-for-alumni", auth, async (req, res) => {
  try {
    const { course_id } = req.body;
    const jobs = await Job.find().lean();
    let toShow = [];
    for (let job of jobs) {
      if (job.course.length > 0) {
        job.course.forEach((data) => {
          if (data.course.toString() === course_id.toString()) {
            toShow.push(job);
          }
        });
      } else {
        toShow.push(job);
      }
    }
    return res.status(200).json({ msg: "Job list", jobs: toShow });
  } catch (e) {
    return res.status(400).json({ msg: "No Job Available" });
  }
});
router.post("/get-event-for-alumni", auth, async (req, res) => {
  try {
    const { course_id } = req.body;
    const jobs = await Event.find().lean();
    let toShow = [];
    for (let job of jobs) {
      if (job.course.length > 0) {
        job.course.forEach((data) => {
          if (data.course.toString() === course_id.toString()) {
            toShow.push(job);
          }
        });
      } else {
        toShow.push(job);
      }
    }
    return res.status(200).json({ msg: "Event list", Event: toShow });
  } catch (e) {
    return res.status(400).json({ msg: "Failed to Get Event Data" });
  }
});
router.post("/get-user-notification/", auth, async (req, res) => {
  try {
    const { course_id, user_id } = req.body;
    const notify_users = await NotifyUser.find().lean();
    let toShow = [];
    for (let notify_user of notify_users) {
      if (notify_user.course.length > 0) {
        notify_user.course.forEach((data) => {
          if (data.course.toString() === course_id.toString()) {
            const isViewed = notify_user.viewedBy.filter(
              (data) => data.user.toString() === user_id.toString()
            );
            delete notify_user.viewedBy;
            toShow.push({
              ...notify_user,
              viewed: isViewed.length > 0 ? true : false,
            });
          }
        });
      } else {
        const isViewed = notify_user.viewedBy.filter(
          (data) => data.user.toString() === user_id.toString()
        );
        delete notify_user.viewedBy;
        toShow.push({
          ...notify_user,
          viewed: isViewed.length > 0 ? true : false,
        });
      }
    }
    return res.status(200).json({ msg: "Notification list", Notif: toShow });
  } catch (e) {
    return res.status(400).json({ msg: "Failed" });
  }
});
router.post("/update-viewed-notification", auth, async (req, res) => {
  try {
    const { user_id, notification_id } = req.body;
    const isUserAlreadyInList = await NotifyUser.findOne({
      _id: notification_id,
      "viewedBy.user": user_id,
    }).lean();
    if (isUserAlreadyInList) {
      return res.status(200).json({ msg: "Already Viewed" });
    } else {
      const pushing = await NotifyUser.updateOne(
        { _id: notification_id },
        {
          $push: {
            viewedBy: {
              user: user_id,
            },
          },
        }
      );
      return res.status(200).json({ msg: "Push Viewed", pushing });
    }
  } catch (e) {
    return res.status(400).json({ msg: "Failed" });
  }
});

router.post("/get-job-information-to-apply", auth, async (req, res) => {
  try {
    const { jobId, userId } = req.body;
    const ifJobExist = await Job.findOne({ _id: jobId }).lean();
    if (ifJobExist) {
      const isJobAlreadyApplied = await JobApply.findOne({
        job: jobId,
        user: userId,
      }).lean();
      return res.status(200).json({
        msg: "Job Information",
        job: { ...ifJobExist, applied: isJobAlreadyApplied ? true : false },
      });
    } else {
      return res.status(400).json({ msg: "Failed to get Job Details" });
    }
  } catch (e) {
    return res.status(400).json({ msg: "Failed to get Job Details" });
  }
});
module.exports = router;
