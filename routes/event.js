const router = require("express").Router();
const nodemailer = require("nodemailer");
const { imageUpload } = require("./../middleware/common-middleware");
const moment = require("moment");
//Models
const Event = require("../Model/Event");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "evsutracer@gmail.com",
    pass: "123qweasdzxcA!",
  },
});

// @route     POST api/event
// @desc      CREATE Event
// @access    Private
router.post("/", imageUpload.array("images"), async (req, res) => {
  const { eventSchedule, eventTitle, eventDescription, eventImage, emails } =
    req.body;

  try {
    const mailOptions = {
      from: "Evsu Tanauan Management",
      to: emails,
      subject: "Alumni Upcoming Events!",
      text: "Alumni Events",
      html: `
      <body>
        <img src="https://www.evsu.edu.ph/wp-content/uploads/2020/01/EVSU-Logo.png"/>
        <h1> New Upcoming Event from Evsu Tracer! </h1> 
        <h2> ${eventTitle} </h2> 
        <p> <span style="font-weight:bold;"> Event description </span>  ${eventDescription}. </p> <br/>
        <p> See you there at ${moment(eventSchedule).format("LL")}! </p> 
      </body>
      `,
    };
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ msg: "Server Error login" });
      } else {
        // console.log("Email sent: " + info.response);

        let eventObject = {
          eventTitle,
          eventDescription,
          eventSchedule,
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
        const event = await newEvent.save();
        return res.status(200).json(event);
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
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
