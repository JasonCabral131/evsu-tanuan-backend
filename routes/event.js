const router = require("express").Router();
const cloudinary = require("./../config/cloudinaryConfig");
const {
  imageUpload,
  sendingEmail,
} = require("./../middleware/common-middleware");
const moment = require("moment");
//Models
const Event = require("../Model/Event");
const User = require("./../Model/User");

// @route     POST api/event
// @desc      CREATE Event
// @access    Private
router.post("/", imageUpload.array("images"), async (req, res) => {
  const { eventSchedule, eventTitle, eventDescription, course, type } =
    req.body;

  try {
    // console.log("Email sent: " + info.response);
    let eventObject = {
      eventTitle,
      eventDescription,
      eventSchedule,
      course: new Boolean(type) ? [] : course,
    };
    let eventImage = [];
    if (req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path);
        eventImage.push({
          url: result.secure_url,
          cloudinary_id: result.public_id,
        });
      }
      eventObject.eventImage = eventImage;
    }
    const newEvent = new Event(eventObject);
    newEvent.save(async (error, save) => {
      if (error) {
        return res.status(400).json({ msg: "Failed to add Events" });
      }
      let emails = [];
      if (new Boolean(type)) {
        emails = await User.find().select("email -_id").lean();
      } else {
        for (let i = 0; i < course.length; i++) {
          const users = await User.find({ course: course[i] })
            .select("email -_id")
            .lean();
          emails = [...emails, ...users];
        }
      }
      if (emails.length > 0) {
        const mailOptions = {
          from: "Evsu Tanauan Management",
          to: emails.map((data) => {
            return data.email;
          }),
          subject: "Alumni Upcoming Events!",
          text: "Alumni Events",
          html: `
              <body>
                <img src="https://www.evsu.edu.ph/wp-content/uploads/2020/01/EVSU-Logo.png"/>
                <h1> New Upcoming Event from Evsu Tracer! </h1>
                <h2> ${eventTitle} </h2>
                <p> <span style="font-weight:bold;"> Event description </span>  ${eventDescription}. </p> <br/>
                <p> See you there at ${moment(new Date(eventSchedule)).format(
                  "LL"
                )}! </p>
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
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     GET api/event
// @desc      FETCH Events
// @access    Private
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({
      date: -1,
    });
    res.status(200).json(events);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     PUT api/event/:id
// @desc      Updat Event
// @access    Private
router.put("/:id", async (req, res) => {
  const { eventTitle, eventDescription, eventSchedule } = req.body;
  // eventSchedule
  try {
    const updateEvent = await Event.updateOne(
      { _id: req.params.id },
      {
        $set: {
          eventTitle,
          eventDescription,
          eventSchedule,
        },
      }
    );
    res.status(200).json(updateEvent);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     Delete api/event/:id
// @desc      Delete Event
// @access    Private
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedEvent);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

module.exports = router;
