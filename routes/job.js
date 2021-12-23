const router = require("express").Router();

const nodemailer = require("nodemailer");
const { imageUpload } = require("./../middleware/common-middleware");
//Models
const Job = require("../Model/Job");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "evsutracer@gmail.com",
    pass: "123qweasdzxcA!",
  },
});

// @route     POST api/job
// @desc      CREATE Job
// @access    Private
router.post("/", imageUpload.array("images"), async (req, res) => {
  const { jobTitle, jobCompany, jobDescription, jobImage, emails } = req.body;

  // console.log(jobTitle, jobCompany, jobDescription, jobImage);

  try {
    const mailOptions = {
      from: "evsutracer@gmail.com",
      to: emails,
      subject: "Alumni Job Offer",
      text: "Job Posting",
      html: `
      <body>
        <img src="https://www.evsu.edu.ph/wp-content/uploads/2020/01/EVSU-Logo.png"/>
        <h1> We are Hiring at ${jobCompany}! </h1> 
        <h2> Looking for a ${jobTitle}. </h2> 
        <p> <span style="font-weight:bold;"> Job description </span>  ${jobDescription}. </p> <br/>
        <p> If you are interested, please emails us your resume at ${jobCompany}@gmail.com Thank you! </p>
      </body>
      `,
    };
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
        res.status(500).json({ msg: "Server Error login" });
      } else {
        // console.log("Email sent: " + info.response);
        let jobObject = {
          jobTitle,
          jobCompany,
          jobDescription,
        };
        let jobImage = [];
        if (req.files.length > 0) {
          for (let i = 0; i < req.files.length; i++) {
            const result = await cloudinary.uploader.upload(req.files[i].path);
            jobImage.push({
              url: result.secure_url,
              cloudinary_id: result.public_id,
            });
          }
          jobObject.jobImage = jobImage;
        }
        const newJob = new Job(jobObject);

        const savedJob = await newJob.save();
        res.status(200).json(savedJob);
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     GET api/job
// @desc      FETCH Jobs
// @access    Private
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({
      date: -1,
    });
    res.status(200).json(jobs);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     PUT api/job/:id
// @desc      Update Job
// @access    Private
router.put("/:id", async (req, res) => {
  const { jobTitle, jobCompany, jobDescription } = req.body;
  try {
    const updatedJob = await Job.updateOne(
      { _id: req.params.id },
      {
        $set: {
          jobTitle,
          jobCompany,
          jobDescription,
        },
      }
    );
    res.status(200).json(updatedJob);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     DELETE api/job/:id
// @desc      Delete Job
// @access    Private
router.delete("/:id", async (req, res) => {
  try {
    const deletedJob = await Job.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedJob);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

module.exports = router;
