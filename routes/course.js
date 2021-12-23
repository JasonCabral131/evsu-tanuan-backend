const router = require("express").Router();

//Models
const Course = require("../Model/Course");

// Mock Data
const coursesMock = require("../mock/course");

// @route     GET api/course
// @desc      FETCH Course
// @access    Private
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({
      date: -1,
    });

    return res.status(200).json(courses);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     POST api/course
// @desc      Create Course
// @access    Private
router.post("/", async (req, res) => {
  const { courseName, courseAbbreviation } = req.body;
  try {
    const newCourse = new Course({
      courseName,
      courseAbbreviation,
    });
    const course = await newCourse.save();
    return res.status(200).json(course);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     Delete api/course/:id
// @desc      Delete Course
// @access    Private
router.delete("/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.updateOne(
      { _id: req.params.id },
      {
        $set: {
          status: "archived",
        },
      }
    );
    return res.status(200).json(deletedCourse);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     Update api/course/:id
// @desc      Update Course
// @access    Private
router.put("/:id", async (req, res) => {
  const { courseName, courseAbbreviation } = req.body;
  try {
    const updatedCourse = await Course.updateOne(
      { _id: req.params.id },
      {
        $set: {
          courseName,
          courseAbbreviation,
        },
      }
    );
    return res.status(200).json(updatedCourse);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server Error login" });
  }
});

// @route     PUT api/course/addUser/:id
// @desc      Add User to Course
// @access    Private
router.put("/addUser/:id", async (req, res) => {
  // Get User Schema IDs
  const users = req.body.users;

  try {
    const updated = await Course.updateOne(
      { _id: req.params.id },
      {
        $addToSet: {
          users,
        },
      }
    );
    res.status(200).json({ msg: "User Added with his course", updated });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route     POST api/course/insertMany
// @desc      ADD ALL Courses
// @access    Private
router.post("/insertMany", async (req, res) => {
  try {
    const courses = await Course.insertMany(coursesMock);
    res.status(200).json(courses);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error login" });
  }
});

module.exports = router;
