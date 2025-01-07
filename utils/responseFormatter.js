const responseFormatter = (res, code, status, message, data=null) => {
  return res.status(code).json({
    success: status,
    message,
    data,
  });
};

module.exports = { responseFormatter };
