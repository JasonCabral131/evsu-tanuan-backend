const router = require("express").Router();

const nodemailer = require("nodemailer");

//Models
const Subscriber = require("../Model/Subscriber");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "evsutracer@gmail.com",
    pass: "123qweasdzxcA!",
  },
});

// @route     POST api/subscribe
// @desc      Add Subscribe
// @access    Private
router.post("/", async (req, res) => {
  const { subscriberEmail } = req.body;

  console.log(subscriberEmail);

  const email = await Subscriber.findOne({ subscriberEmail });
  if (email) {
    return res.status(500).json({ msg: "Email is already Registered" });
  }

  try {
    var mailOptions = {
      from: "evsutracer@gmail.com",
      to: `${subscriberEmail}`,
      subject: "Form Survey",
      text: "Alumni Form Survey",
      html: `
      <body>
        <img src="https://www.evsu.edu.ph/wp-content/uploads/2020/01/EVSU-Logo.png"/>
        <h1> Alumni Tracer Survey! </h1> 
        <p> This survey form is used to trace students who graduated from EVSU and what they're doing now. </p>
        <p> Name: </p>
        <p> Middle Name: </p>
        <p> Last Name: </p>
        <p> Email: </p>
        <p> Phone: </p>
        <p> Age: </p>
        <p> Sex: </p>
        <p> Batch Graduated: </p>
        <p> Course: </p>
        <p> Status: </p>
        <p> Current Work: </p>
        <p> Monthly Income: </p>
        <p> Yearly Income: </p>
        <p> Life Status: </p>
        <p> Image: </p>
        <p> Your response is needed in this survey Thank you! God  Bless </p>
      </body>
      `,
    };

    //   <p> <span style="font-weight:bold;"> Please click the link to open the survey </span>  <a href="http://localhost:3000/alumniform" target="_blank"> Alumni Form Click here </a> </p>
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        // Check Emails Error
        console.log(error);
        console.log(`Error response code ${error.responseCode}`);

        if (error.responseCode == 553) {
          return res.status(400).json({ msg: "Email does not exist" });
        }
        res.status(500).json({ msg: "Server Error Only" });
      } else {
        console.log("Email sent: " + info.response);

        const newSubscriber = new Subscriber({ subscriberEmail });
        const subscriber = await newSubscriber.save();
        res.status(200).json(subscriber);
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error " });
  }
});

// @route     GET api/subscribe
// @desc      Fetch Subscribe users
// @access    Private
router.get("/", async (req, res) => {
  try {
    const emails = await Subscriber.find().sort({
      date: -1,
    });
    res.status(200).json(emails);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     PUT api/subscribe/:id
// @desc      Update Subscribe users
// @access    Private
router.put("/:id", async (req, res) => {
  const { subscriberEmail } = req.body;
  try {
    const updateEmail = await Subscriber.updateOne(
      { _id: req.params.id },
      {
        $set: {
          subscriberEmail,
        },
      }
    );
    res.status(200).json(updateEmail);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     Delete api/subscribe/:id
// @desc      Delete Subscribe user
// @access    Private
router.delete("/:id", async (req, res) => {
  try {
    const deletedEmail = await Subscriber.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedEmail);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

module.exports = router;
