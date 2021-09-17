const mongoose = require("mongoose");

const dbname = process.env.DB_NAME || "test";
const uri = "mongodb://localhost/" + dbname;

module.exports = async () => {
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};
