// Init Express
const express = require("express");
const app = express();
const cors = require("cors");
const NotifyUser = require("./Model/notify-users");
const Event = require("./Model/Event");
// Connect Database
const db = require("./database");
db();

// Middleware
app.use(express.json());
app.use(cors());

setInterval(async () => {
  const dateNow = new Date().toLocaleDateString();
  const ifEventThisDay = await Event.findOne({ eventSchedule: dateNow }).lean();
  if (ifEventThisDay) {
    console.log(dateNow);
    await new NotifyUser({
      link: `/event-information-to-attend/${ifEventThisDay._id}`,
      message: `Event Happening right now!!,  I am hoping to see your there!!  <span style={{fontWeight: 'bolder', letterSpacing: 2}}>${ifEventThisDay.eventTitle}</span>`,
      course: ifEventThisDay.course,
    }).save();
    console.log(dateNow);
  }
}, 4000);
// Routes
app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/user"));
app.use("/api/course", require("./routes/course"));
app.use("/api/log", require("./routes/log"));
app.use("/api/loginadmin", require("./routes/loginadmin"));
app.use("/api/loginuser", require("./routes/loginuser"));
app.use("/api/resetpassword", require("./routes/resetPassword"));
app.use("/api/subscribe", require("./routes/subscribe"));
app.use("/api/job", require("./routes/job"));
app.use("/api/event", require("./routes/event"));
app.use("/api/changePassword", require("./routes/changePassword"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
});
