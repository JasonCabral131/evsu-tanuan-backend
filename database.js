const mongoose = require("mongoose");

const connectTodb = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://evsutracer:evsutracer@cluster0.sni1x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
      // {
      //   useCreateIndex: true,
      //   useFindAndModify: true,
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
      // }
    );
    console.log("Connected to database");
  } catch (error) {
    console.log("Error" + error.message);
    process.exit(1);
  }
};

module.exports = connectTodb;
