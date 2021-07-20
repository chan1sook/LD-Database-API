require("colors");

module.exports = (showLog = false) => {
  return (req, res, next) => {
    if (showLog) {
      console.log(`[${req.method}]`.yellow + ` ${req.path}`);
      const queryLog = JSON.stringify(req.query);
      if (queryLog !== "{}") {
        console.log(`[Query]`.green + ` ${queryLog}`);
      }
      const bodyLog = JSON.stringify(req.body);
      if (bodyLog !== "{}") {
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
