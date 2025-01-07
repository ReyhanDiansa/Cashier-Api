const jsonwebtoken = require("jsonwebtoken");
const { responseFormatter } = require("../utils/responseFormatter");
const md5 = require("md5");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { loginSchema, registerSchema } = require("../utils/validationSchema");

exports.Login = async (request, response) => {
  try {
    const { error } = loginSchema.validate(request.body);
    if (error) {
      return responseFormatter(
        response,
        400,
        false,
        error.details[0].message,
        null
      );
    }

    const data = {
      email: request.body.email,
      password: md5(request.body.password),
    };

    const user = await prisma.user.findFirst({
      where: data,
    });

    if (!user) {
      return responseFormatter(
        response,
        400,
        false,
        "Email or Password incorrect",
        null
      );
    } else {
      const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const token = jsonwebtoken.sign(
        tokenPayload,
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: process.env.JWT_EXPIRATION,
        }
      );

      return responseFormatter(
        response,
        200,
        true,
        "Successfully login",
        token
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.Register = async (request, response) => {
  try {
    const { error } = registerSchema.validate(request.body);
    if (error) {
      return responseFormatter(
        response,
        400,
        false,
        error.details[0].message,
        null
      );
    }

    const data = {
      username: request.body.username,
      email: request.body.email,
      password: md5(request.body.password),
    };

    if (request.body.role) {
      data.role = request.body.role;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: data.email.toLowerCase(),
            },
          },
          {
            username: {
              equals: data.username.toLowerCase(),
            },
          },
        ],
      },
    });

    if (!user) {
      const createdUser = await prisma.user.create({
        data,
      });
      return responseFormatter(
        response,
        201,
        true,
        "Register Successfully",
        createdUser
      );
    } else {
      return responseFormatter(
        response,
        400,
        false,
        "User already exists, please look for another email/username",
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};
