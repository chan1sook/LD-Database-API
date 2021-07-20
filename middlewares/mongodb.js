const mongoose = require("mongoose");

const dbname = process.env.DB_NAME || "test";
const uri = "mongodb://localhost/" + dbname;

require("colors");

module.exports = async () => {
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};
