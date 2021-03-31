const dotenv = require("dotenv");
const express = require("express");
const compression = require("compression");
const mongoose = require("mongoose");

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();

const dbName = process.env.DB_NAME || "test";

mongoose.connect(`mongodb://localhost/${dbName}`, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});

if (process.env.NODE_ENV === "production") {
  app.use(compression());
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const studentRouter = require("./routes/student");
const scoreRouter = require("./routes/score");

app.use(studentRouter);
app.use(scoreRouter);

const { toLogObject } = require("./utils");
app.use("*", (req, res) => {
  return res.status(404).json(
    toLogObject({
      action: `${req.method} ${req.path}`,
      response: {
        error: "API not valid",
      },
    })
  );
});

app.listen(port, () => {
  console.log(`Server Start at Port ${port}`);
});
