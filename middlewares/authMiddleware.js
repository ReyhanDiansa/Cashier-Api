const jsonwebtoken = require("jsonwebtoken");
const { responseFormatter } = require("../utils/responseFormatter");
require("dotenv/config");

const authVerify = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header == null) {
      return responseFormatter(res, 401, false, "Missing token", null);
    }

    let token = header.split(" ")[1];

    let decodedToken;
    try {
      decodedToken = await jsonwebtoken.verify(
        token,
        process.env.JWT_SECRET_KEY
      );
    } catch (error) {
      if (error instanceof jsonwebtoken.TokenExpiredError) {
        return responseFormatter(res, 401, false, "Token expired", null);
      }

      return responseFormatter(res, 401, false, "Invalid token", null);
    }

    req.userData = decodedToken;
    next();
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

module.exports = { authVerify };
