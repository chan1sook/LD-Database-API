require("colors");

module.exports = (showLog = false) => {
  console.log(`[Show Log]`.blue + ` ${showLog}`);

  return (req, res, next) => {
    console.log(`[${req.method}]`.yellow + ` ${req.path}`);
    if (showLog) {
      const queryLog = JSON.stringify(req.query);
      if (queryLog !== "{}") {
        console.log(`[Query]`.green + ` ${queryLog}`);
      }
      const bodyLog = JSON.stringify(req.body);
      if (typeof bodyLog !== "undefined" && bodyLog !== "{}") {
        console.log(`[Body]`.green + ` ${bodyLog}`);
      }
      const paramLog = JSON.stringify(req.params);
      if (paramLog !== "{}") {
        console.log(`[Params]`.green + ` ${paramLog}`);
      }
    }

    next();
  };
};
