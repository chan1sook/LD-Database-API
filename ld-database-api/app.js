require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const mongodb = require("./configurations/mongodb");
const session = require("./configurations/session");
const showlog = require("./middlewares/showlog");
const { toLogObject } = require("./utils/utils");

const port = process.env.PORT || 3000;
const app = express();

mongodb().catch(console.error);

if (process.env.NODE_ENV === "production") {
  app.use(compression());
}
app.use(session);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(showlog(process.env.NODE_ENV === "development"));

const userRouter = require("./routes/user");
const scoreRouter = require("./routes/score");
const reportRouter = require("./routes/report");
const maintainRouter = require("./routes/maintain");

app.use(userRouter);
app.use(scoreRouter);
app.use(reportRouter);
app.use(maintainRouter);

app.get("/", (req, res) => {
  return res.status(200).json(
    toLogObject({
      action: `${req.method} ${req.path}`,
      response: {
        status: "OK",
      },
    })
  );
});

app.all("*", (req, res) => {
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
