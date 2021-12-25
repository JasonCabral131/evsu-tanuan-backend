const router = require("express").Router();
const cloudinary = require("./../config/cloudinaryConfig");

const { imageUpload } = require("./../middleware/common-middleware");
//Models
const Job = require("../Model/Job");
const JobApply = require("./../Model/JobApply");
const User = require("./../Model/User");
const Notify = require("./../Model/notifier");
const { sendingEmail } = require("./../middleware/common-middleware");
// @route     POST api/job
// @desc      CREATE Job
// @access    Private
router.post("/", imageUpload.array("images"), async (req, res) => {
  const { jobTitle, jobCompany, jobDescription, course, type } = req.body;

  // console.log(jobTitle, jobCompany, jobDescription, jobImage);
  try {
    const coursx = JSON.parse(course);
    let jobObject = {
      jobTitle,
      jobCompany,
      jobDescription,
      course: JSON.parse(type)
        ? []
        : coursx.map((data) => {
            return { course: data };
          }),
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

    newJob.save(async (error, save) => {
      if (error) {
        return res.status(400).json({ msg: "Failed to add Job" });
      }
      let emails = [];
      if (JSON.parse(type)) {
        emails = await User.find().select("email -_id").lean();
      } else {
        for (let i = 0; i < coursx.length; i++) {
          const users = await User.find({ course: coursx[i] })
            .select("email -_id")
            .lean();
          emails = [...emails, ...users];
        }
      }
      if (emails.length > 0) {
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
        const sending = await sendingEmail(mailOptions);
        return res
          .status(200)
          .json({ msg: "Successfully Created", save, sending });
      }
      return res.status(200).json({ msg: "Successfully Created", save });
    });
    return res.status(200).json(savedJob);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     GET api/job
// @desc      FETCH Jobs
// @access    Private
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({ status: "active" }).sort({
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
router.put("/:id", imageUpload.array("images"), async (req, res) => {
  const { jobTitle, jobCompany, jobDescription, course, type } = req.body;
  try {
    const courx = JSON.parse(course);
    const updatedJob = await Job.updateOne(
      { _id: req.params.id },
      {
        $set: {
          jobTitle,
          jobCompany,
          jobDescription,
          course: JSON.parse(type) ? [] : courx,
        },
      }
    );
    if (updatedJob) {
      let jobImage = [];
      if (req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const result = await cloudinary.uploader.upload(req.files[i].path);
          jobImage.push({
            url: result.secure_url,
            cloudinary_id: result.public_id,
          });
        }
      }
      const uploadingData = await Job.update(
        { _id: req.params.id },
        { $push: { jobImage: { $each: jobImage } } },
        { upsert: true }
      );
      return res.status(200).json({ msg: "success updating", uploadingData });
    } else {
      return res.status(500).json({ msg: "Server Error login" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     DELETE api/job/:id
// @desc      Delete Job
// @access    Private
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Job.updateOne(
      { _id: req.params.id },
      {
        $set: {
          status: "archived",
        },
      }
    );
    res.status(200).json(deletedEvent);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});
router.post("/job-deleting-image/", async (req, res) => {
  try {
    const { jobId, imageId } = req.body;
    const deleting = await Job.updateOne(
      { _id: jobId },
      {
        $pull: {
          jobImage: {
            _id: imageId,
          },
        },
      }
    );
    return res.status(200).json({ msg: "Success deleting", deleting });
  } catch (e) {
    return res.status(400).json({ msg: "No Data Found" });
  }
});

router.get("/job-info/:id", async (req, res) => {
  try {
    const event = await Job.findOne({ _id: req.params.id }).lean();
    if (event) {
      return res.status(200).json({ msg: "Job", event });
    }
    return res.status(400).json({ msg: "Failed to retrieved data" });
  } catch (e) {
    return res.status(400).json({ msg: "No Data Found" });
  }
});

router.post("/apply-job-web", imageUpload.array("images"), async (req, res) => {
  try {
    const { job, user } = req.body;
    const apply = await JobApply.findOne({ job, user }).lean();
    if (apply) {
      return res.status(400).json({ msg: "You Already Apply for Job" });
    }
    let jobApply = {
      job,
      user,
    };
    let resume = [];
    if (req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path);
        resume.push({
          url: result.secure_url,
          cloudinary_id: result.public_id,
        });
      }
      jobApply.resume = resume;
    }
    const saving = await new JobApply(jobApply).save();
    return res.status(200).json({ msg: "Applied Successfully", saving });
  } catch (e) {
    return res.status(400).json({ msg: "Failed to get Data" });
  }
});
module.exports = router;
