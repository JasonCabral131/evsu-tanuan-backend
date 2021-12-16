const router = require("express").Router();

//Models
const Log = require("../Model/Log");

// @route     POST api/log
// @desc      CREATE Activity Log
// @access    Private
router.post("/", async (req, res) => {
  const { name, logDescription } = req.body;
  try {
    const newLog = new Log({
      name,
      logDescription,
    });
    const savedLog = await newLog.save();
    res.status(200).json(savedLog);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     GET api/log
// @desc      FETCH Activity Logs
// @access    Private
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find().sort({
      date: -1,
    });
    res.status(200).json(logs);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     PUT api/log/:id
// @desc      Update Activity Log
// @access    Private
router.put("/:id", async (req, res) => {
  const { name, logDescription } = req.body;

  try {
    const updatedLog = await Log.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name,
          logDescription,
        },
      }
    );
    res.status(200).json(updatedLog);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     DELETE api/log/:id
// @desc      Delete Activity Log
// @access    Private
router.delete("/:id", async (req, res) => {
  try {
    const deletedLog = await Log.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedLog);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

module.exports = router;
