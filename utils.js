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

module.exports.filterParams = function (obj, params) {
  const result = {};
  for (const param of params) {
    result[param] = obj[param];
  }
  return result;
};
