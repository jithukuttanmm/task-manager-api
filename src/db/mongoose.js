const mongoose = require("mongoose");

mongoose.connect(process.env.MONGOOSE_URL, {
  useNewUrlParser: true,
  useCreateIndex: true, // make sure mongoose work create index to access easily
  useFindAndModify: false,
  useUnifiedTopology: true,
});
