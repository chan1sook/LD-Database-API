const path = require("path");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const mongodb = require("./middlewares/mongodb");
const session = require("./middlewares/session");
const showlog = require("./middlewares/showlog");
const { toLogObject } = require("./utils/utils");

const port = process.env.PORT || 3000;
const app = express();

mongodb().catch(console.error);

app.set("view engine", "ejs");

if (process.env.NODE_ENV === "production") {
  app.use(compression());
}
app.use(session);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(showlog(true));

const userRouter = require("./routes/user");
const scoreRouter = require("./routes/score");
const reportRouter = require("./routes/report");

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(userRouter);
app.use(scoreRouter);
app.use(reportRouter);

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
