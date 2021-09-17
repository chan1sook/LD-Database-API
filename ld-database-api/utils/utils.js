module.exports.toLogObject = function ({
  timestamp = Date.now(),
  action = "default",
  response,
  parameters,
}) {
  return {
    timestamp,
    action,
    parameters,
    response,
  };
};

module.exports.filterParams = function (obj, params, optionalParams = []) {
  const result = {};
  for (const param of params) {
    result[param] = obj[param];
  }
  for (const param of optionalParams) {
    result[param] = obj[param];
  }
  return result;
};

module.exports.checkMissingParams = function (
  obj,
  params,
  optionalParams = []
) {
  const missingParams = [];
  for (const param of params) {
    if (typeof obj[param] === "undefined" && !optionalParams.includes(param)) {
      missingParams.push(param);
    }
  }
  return missingParams;
};
