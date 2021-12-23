const router = require("express").Router();

//Models
const Course = require("../Model/Course");

// Mock Data
const coursesMock = require("../mock/course");
const User = require("./../Model/User");
// @route     GET api/course
// @desc      FETCH Course
// @access    Private
router.get("/", async (req, res) => {
  try {
    const courseLists = await Course.find({ status: "active" })
      .sort({
        date: -1,
      })
      .lean();
    let courses = [];
    for (let courseList of courseLists) {
      const users = await User.find({ course: courseList._id })
        .select("-status -password")
        .lean();
      courses.push({ ...courseList, users });
    }
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
router.get("/get-archived", async (req, res) => {
  try {
    const courseLists = await Course.find({ status: "archived" })
      .sort({
        date: -1,
      })
      .lean();
    let courses = [];
    for (let courseList of courseLists) {
      const users = await User.find({ course: courseList._id })
        .select("-status -password")
        .lean();
      courses.push({ ...courseList, users });
    }
    return res.status(200).json(courses);
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
    return res.status(200).json({ msg: "User Added with his course", updated });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server Error" });
  }
});

// @route     POST api/course/insertMany
// @desc      ADD ALL Courses
// @access    Private
router.post("/insertMany", async (req, res) => {
  try {
    const hasUsed = await Course.find().lean();
    if (hasUsed.length > 0) {
      return res.status(400).json({ msg: "Course Already Added" });
    }
    const courses = await Course.insertMany(coursesMock);
    return res.status(200).json(courses);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: "Server Error login" });
  }
});

module.exports = router;
