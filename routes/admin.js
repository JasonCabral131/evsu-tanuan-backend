const router = require("express").Router();
const bcrypt = require("bcrypt");
const Notif = require("./../Model/notifier");
const shortid = require("shortid");
const { sendingEmail } = require("./../middleware/common-middleware");
//Models
const Admin = require("../Model/Admin");
const { json } = require("express/lib/response");

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
router.post("/reset-admin", async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email }).lean();
    if (admin) {
      const salt = 10;
      const generatedPassword = shortid.generate();
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);

      const mailoption = {
        from: "Evsu Tanauan Management",
        to: email,
        subject: "Forgot Password",
        text: "Your New Password ",
        html: `  <h1 >Your New Password</h1>
        <h1 style="color: red;">${generatedPassword}</h1>`,
      };
      const sending = await sendingEmail(mailoption);
      const updated = await Admin.updateOne(
        { email },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );
      return res
        .status(200)
        .json({ msg: "Password Updated", updated, sending });
    } else {
      return res.status(400).json({ msg: "Failed to Reset Password x" });
    }
  } catch (e) {
    return res.status(400).json({ msg: "Failed to Reset Password" });
  }
});

router.get("/get-notification-info", async (req, res) => {
  const notif = await Notif.find().sort({ createdAt: -1 }).lean();
  return res.status(200).json({ msg: "Notif data", notif });
});
router.get("/update-viewed-notif/:id", async (req, res) => {
  try {
    const updating = await Notif.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          viewed: true,
        },
      },
      {
        upsert: true,
      }
    );
    return res.status(200).json(updating);
  } catch (e) {
    return res.status(400).json({ msg: "failed" });
  }
});
router.post("/send-job-application-resume", async (req, res) => {
  try {
    const { resume, email, jobTitle } = req.body;
    let img = "";

    if (Array.isArray(resume)) {
      resume.forEach((data) => {
        img += `<img src="${data}" style="margin-top: 15px; display: block; "/><br /><br />`;
      });
    }

    console.log("resume", resume);
    console.log("img", img);
    var mailOptions = {
      from: "evsutracer@gmail.com",
      to: email,
      subject: `Resume ${jobTitle}`,
      text: "Job Resume Information",
      html: `
      <body style="width: 100%;">
        <img src="https://www.evsu.edu.ph/wp-content/uploads/2020/01/EVSU-Logo.png"/>
        <h1> Evsu Alumni Job Resume </h1>
        <div style="width: 100%;  padding: 10px;">
          ${img}
        </div>
      </body>
      `,
    };
    const sending = await sendingEmail(mailOptions);
    return res.status(200).json({ sending });
  } catch (e) {
    return res.status(400).json({ msg: "Failed to send Resume" });
  }
});
module.exports = router;
