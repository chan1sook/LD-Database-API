require("colors");

const {
  toLogObject,
  filterParams,
  checkMissingParams,
} = require("../utils/utils");

module.exports = (target, requiredParams = [], optionalParams = []) => {
  return (req, res, next) => {
    req.parameters = filterParams(req[target], requiredParams, optionalParams);
    const missingParams = checkMissingParams(
      req.parameters,
      requiredParams,
      optionalParams
    );

    if (missingParams.length > 0) {
      const strMissingParams = missingParams.join(", ");
      return res.status(400).json(
        toLogObject({
          action: `${req.method} ${req.path}`,
          response: {
            error: `Missing Parameter(s): ${strMissingParams}`,
          },
          parameters: req.parameters,
        })
      );
    }

    next();
  };
};
