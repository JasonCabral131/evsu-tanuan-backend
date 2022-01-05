const router = require("express").Router();
const bcrypt = require("bcrypt");
const cloudinary = require("./../config/cloudinaryConfig");
const auth = require("./../middleware/auth");
//Models
const User = require("../Model/User");
const {
  imageUpload,
  sendingEmail,
} = require("./../middleware/common-middleware");
const Notify = require("./../Model/notifier");
const Job = require("./../Model/Job");
const JobApply = require("./../Model/JobApply");
const Event = require("./..//Model/Event");
const EventAttend = require("./../Model/EventAttending");
const NotifyUser = require("./../Model/notify-users");
// @route     GET api/user
// @desc      FETCH User
// @access    Private
router.get("/", auth, async (req, res) => {
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
router.get("/pending-user", auth, async (req, res) => {
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
router.get("/archived-user", auth, async (req, res) => {
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
router.get("/banned-user", auth, async (req, res) => {
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
          message: `New User has been sign up!, Check the information for approval <span style="font-weight: bold;">${
            saving.firstname + " " + saving.lastname
          }</span>`,
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
router.get("/get-user-information/:id", auth, async (req, res) => {
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

router.post("/update-status-user", auth, async (req, res) => {
  try {
    const { userId, status } = req.body;
    const isExist = await User.findOne({ _id: userId }).lean();
    if (isExist) {
      const updating = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { status: "active" } }
      );
      if (updating) {
        var mailOptions = {
          from: "Evsu Alumni Management",
          to: isExist.email,
          subject: `Account Activated`,
          text: "Account is now Activated",
          html: `
          <body style="width: 100%;">
            <img src="https://www.evsu.edu.ph/wp-content/uploads/2020/01/EVSU-Logo.png"/>
            <h1> Welcome to Evsu Alumni you can now access your Account  </h1>
            <p style="margin-top: 10px;">Visit at <a href="https://tanauan-evsu-client.vercel.app">evsu-alumni.netlify.app</a</p>
            <br />
            <p style="margin-top: 10px;">Please download this application @  <a href="https://drive.google.com/file/d/1-AjLBE8wnHCQYKqkrst01BhlC19JffS_/view?usp=sharing">google drive</a</p>
          </body>
          `,
        };
        await sendingEmail(mailOptions);
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
router.post("/deleting-pending-request", auth, async (req, res) => {
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
router.put("/:id", auth, async (req, res) => {
  return res.status(400).json({ failed: "ngi-" });
});
router.post("/get-job-for-alumni", auth, async (req, res) => {
  try {
    const { course_id } = req.body;
    const jobs = await Job.find().sort({ date: -1 }).lean();
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
    const jobs = await Event.find().sort({ date: -1 }).lean();
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
    const notify_users = await NotifyUser.find().sort({ Date: -1 }).lean();
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
router.post("/get-event-information-to-attend", auth, async (req, res) => {
  try {
    const { eventId, userId } = req.body;
    const isEventExist = await Event.findOne({ _id: eventId }).lean();
    if (isEventExist) {
      const attendings = await EventAttend.find({ event: isEventExist._id })
        .populate("user", "-password")
        .sort({ createdAt: -1 })
        .lean();
      const isUserAlreadyAttended = await EventAttend.findOne({
        event: isEventExist._id,
        user: userId,
      }).lean();
      let users = [];
      for (let attending of attendings) {
        users.push({ ...attending.user });
      }
      return res.status(200).json({
        msg: "Event Information",
        eventInfo: {
          ...isEventExist,
          attending: users,
          attended: isUserAlreadyAttended ? true : false,
        },
      });
    } else {
      return res.status(400).json({ msg: "Failed to get Event Information" });
    }
  } catch (e) {
    return res.status(400).json({ msg: "Failed to get Event Information" });
  }
});
router.post(
  "/update-user-profile",
  auth,
  imageUpload.single("profile"),
  async (req, res) => {
    try {
      const oldProfile = await User.findOne({ _id: req.user }).lean();
      if (oldProfile) {
        if (req.file) {
          const result = await cloudinary.uploader.upload(req.file.path);
          let profile = {
            url: result.secure_url,
            cloudinary_id: result.public_id,
          };
          const updating = await User.findOneAndUpdate(
            { _id: req.user },
            { $set: { profile } },
            { upsert: true }
          );
          if (updating) {
            await cloudinary.uploader.destroy(oldProfile.profile.cloudinary_id);
            return res.status(200).json({
              msg: "Profile Updated Successfully",
              url: result.secure_url,
            });
          } else {
            return res.status(400).json({ msg: "Failed to updated Profile" });
          }
        } else {
          return res.status(400).json({ msg: "Failed to updated Profile" });
        }
      } else {
        return res.status(400).json({ msg: "Failed to updated Profile" });
      }
    } catch (e) {
      return res.status(400).json({ msg: "Failed to updated Profile" });
    }
  }
);
router.post("/update-user-information", auth, async (req, res) => {
  try {
    const {
      oldpassword,
      presentOccupation,
      companyAddress,
      phone,
      address,
      email,
    } = req.body;
    const isUserExist = await User.findOne({ _id: req.user }).lean();

    if (isUserExist) {
      const isMatch = await bcrypt.compare(oldpassword, isUserExist.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Password Does not Match" });
      }
      const updatedUser = await User.updateOne(
        { _id: req.user },
        {
          $set: {
            presentOccupation,
            companyAddress,
            phone,
            address,
            email,
          },
        }
      );
      return res.status(200).json({ msg: "Update Success fully", updatedUser });
    } else {
      return res.status(400).json({ msg: "User Not Found" });
    }
  } catch (e) {
    return res.status(400).json({ msg: "Failed to updated Profile" });
  }
});
router.get("/get-job-apply", auth, async (req, res) => {
  try {
    const jobList = await JobApply.find({ user: req.user })
      .populate("job")
      .sort({ date: -1 })
      .lean();
    return res.status(200).json(jobList);
  } catch (e) {
    return res.status(400).json({ msg: "Failed to Job Application list" });
  }
});
router.get("/get-event-to-attend", auth, async (req, res) => {
  try {
    const eventList = await EventAttend.find({ user: req.user })
      .populate("event")
      .sort({ date: -1 })
      .lean();
    return res.status(200).json(eventList);
  } catch (e) {
    return res.status(400).json({ msg: "Failed to Job Application list" });
  }
});
router.post("/update-password-user", auth, async (req, res) => {
  try {
    const { oldpassword, new_password } = req.body;
    const isUserExist = await User.findOne({ _id: req.user }).lean();
    if (isUserExist) {
      const isMatch = await bcrypt.compare(oldpassword, isUserExist.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Password Does not Match" });
      }
      const updatedUser = await User.updateOne(
        { _id: req.user },
        {
          $set: {
            password: await bcrypt.hash(new_password, 10),
          },
        }
      );
      return res.status(200).json({ msg: "Update Success fully", updatedUser });
    } else {
      return res.status(400).json({ msg: "User Not Found" });
    }
  } catch (e) {
    return res.status(400);
  }
});
router.get("/get-degree-batch-member", auth, async (req, res) => {
  try {
    const isUserExist = await User.findOne({ _id: req.user }).lean();
    if (isUserExist) {
      const { course, _id, yearGraduated } = isUserExist;
      const BatchMember = await User.find({
        _id: { $ne: _id },
        course,
        yearGraduated,
      }).lean();
      return res.status(200).json(BatchMember);
    } else {
      return res.status(400).json({ msg: "User Not Found" });
    }
  } catch (e) {
    return res.status(400).json({ msg: "Failed to Get Batch Member" });
  }
});
module.exports = router;
