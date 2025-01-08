const { responseFormatter } = require("../utils/responseFormatter");

const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.userData.role;
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      return responseFormatter(res, 403, false, "Access Denied", null);
    }
  };
};

module.exports = { roleCheck };
