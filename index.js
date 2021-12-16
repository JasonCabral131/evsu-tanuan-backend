// Init Express
const express = require("express");
const app = express();
const cors = require("cors");

// Connect Database
const db = require("./database");
db();

// Middleware
app.use(express.json());
app.use(cors());

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
