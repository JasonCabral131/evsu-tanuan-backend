const router = require("express").Router();
const cloudinary = require("./../config/cloudinaryConfig");

const { imageUpload } = require("./../middleware/common-middleware");
//Models
const Job = require("../Model/Job");
const JobApply = require("./../Model/JobApply");
const User = require("./../Model/User");
const Notify = require("./../Model/notifier");
const NotifyUser = require("./../Model/notify-users");
const { sendingEmail } = require("./../middleware/common-middleware");
// @route     POST api/job
// @desc      CREATE Job
// @access    Private
router.post("/", imageUpload.array("images"), async (req, res) => {
  // console.log(jobTitle, jobCompany, jobDescription, jobImage);
  try {
    const { jobTitle, jobCompany, jobDescription, course, type, jobAddress } =
      req.body;
    const coursx = JSON.parse(course);
    let jobObject = {
      jobTitle,
      jobCompany,
      jobDescription,
      jobAddress,
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
        emails = await User.find({ status: "active" })
          .select("email -_id")
          .lean();
      } else {
        for (let i = 0; i < coursx.length; i++) {
          const users = await User.find({ course: coursx[i], status: "active" })
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
        const sendNotify = await new NotifyUser({
          link: `/job-offer-information/${save._id}`,
          message: `New Job Offering Await you check it now!! => <Link to={${`/job-offer-information/${save._id}`}} style={{fontWeight: 'bolder', letterSpacing: 2}}>${jobTitle}</Link>`,
          course: JSON.parse(type)
            ? []
            : coursx.map((data) => {
                return { course: data };
              }),
        }).save();
        return res
          .status(200)
          .json({ msg: "Successfully Created", save, sending, sendNotify });
      }
      return res.status(200).json({ msg: "Successfully Created", save });
    });
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
router.get("/archived-job-list", async (req, res) => {
  try {
    const jobs = await Job.find({ status: "archived" }).sort({
      date: -1,
    });
    return res.status(200).json(jobs);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server Error login" });
  }
});
// @route     PUT api/job/:id
// @desc      Update Job
// @access    Private
router.put("/:id", imageUpload.array("images"), async (req, res) => {
  const { jobTitle, jobCompany, jobDescription, course, type, jobAddress } =
    req.body;
  try {
    const courx = JSON.parse(course);
    const updatedJob = await Job.updateOne(
      { _id: req.params.id },
      {
        $set: {
          jobTitle,
          jobCompany,
          jobDescription,
          jobAddress,
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
router.post("/update-job-status", async (req, res) => {
  try {
    const { jobId } = req.body;
    const updatedJob = await Job.updateOne(
      { _id: jobId },
      {
        $set: {
          status: "active",
        },
      }
    );
    return res.status(200).json({ msg: "Successfully Recovered", updatedJob });
  } catch (e) {
    return res.status(400).json({ msg: "Failed to Updated" });
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
    const { jobId, imageId, cloudinary_id } = req.body;
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
    if (deleting) {
      await cloudinary.uploader.destroy(cloudinary_id);
      return res.status(200).json({ msg: "Success deleting", deleting });
    }
    return res.status(400).json({ msg: "No Data Found" });
  } catch (e) {
    return res.status(400).json({ msg: "No Data Found" });
  }
});

router.get("/job-info/:id", async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id })
      .populate("course.course")
      .lean();
    if (job) {
      return res.status(200).json({ msg: "Job", job });
    }
    return res.status(400).json({ msg: "Failed to retrieved data" });
  } catch (e) {
    return res.status(400).json({ msg: "No Data Found" });
  }
});

router.post("/apply-job-web", imageUpload.array("images"), async (req, res) => {
  try {
    const { job, user } = req.body;
    const findUser = await User.findOne({ _id: user }).lean();
    const apply = await JobApply.findOne({ job, user }).lean();
    if (findUser) {
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
      if (saving) {
        const notifyAdmin = await new Notify({
          link: `/job-applicant-info/${job}/${user}`,
          message: `New Application Found => <Link style={{fontWeight: 'bolder', letterSpacing: 2}} to={${`/job-applicant-info/${job}/${user}`}}>${
            findUser.firstname + " " + findUser.lastname
          }</Link>`,
          profile: `${findUser.profile.url}`,
        }).save();
        return res
          .status(200)
          .json({ msg: "Applied Successfully", saving, notifyAdmin });
      }
      return res.status(400).json({ msg: "Failed to Apply" });
    } else {
      return res.status(400).json({ msg: "Failed to Apply" });
    }
  } catch (e) {
    return res.status(400).json({ msg: "Failed to Apply" });
  }
});
module.exports = router;
