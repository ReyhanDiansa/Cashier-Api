const userModel = require("../models/userModel");
var validator = require("email-validator");

const md5 = require("md5");
const jsonwebtoken = require("jsonwebtoken");
const { responseFormatter } = require("../utils/responseFormatter");
const { loginSchema, registerSchema, userUpdateSchema } = require("../utils/validationSchema");
const mongoose = require("mongoose");



exports.findUser = async (request, response) => {
  try {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseFormatter(response, 400, false, "Invalid Id", null);
    }

    const user = await userModel.findById(id);
    if (!user) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    return responseFormatter(
      response,
      200,
      true,
      "Successfully get user",
      user
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.updateUser = async (request, response) => {
  try {
    const { error } = userUpdateSchema.validate(request.body);
    if (error) {
      return responseFormatter(
        response,
        400,
        false,
        error.details[0].message,
        null
      );
    }

    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseFormatter(response, 400, false, "Invalid Id", null);
    }

    const find = await userModel.findOne({ _id: id });
    if (!find || find === null) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    const data = {
      name: request.body.name,
      email: request.body.email,
      gender: request.body.gender,
    };

    if (request.body.password) {
      data.password = md5(request.body.password);
    }

    const lowercaseEmail = data.email.toLowerCase();

    let checkUser = await userModel.findOne({
      $and: [
        {
          _id: { $ne: id },
          email: { $regex: new RegExp(`^${lowercaseEmail}$`, "i") },
        },
      ],
    });

    if (!checkUser || checkUser === null) {
      await userModel.findByIdAndUpdate(id, data);
      const newItem = await userModel.findOne({ _id: id });
      return responseFormatter(
        response,
        200,
        true,
        "Successfully update user",
        newItem
      );
    } else {
      return responseFormatter(
        response,
        400,
        false,
        `User with email ${data.email} already exists, please look for another email`,
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.getUser = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const { name } = request.query;
    const skip = (page - 1) * limit;
    let totalItems;
    let category;

    if (name) {
      const lowercaseName = name.toLowerCase();

      totalItems = await userModel.countDocuments({
        name: { $regex: new RegExp(lowercaseName, "i") },
      });
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No users data",
          null
        );
      }

      users = await userModel
        .find({ name: { $regex: new RegExp(lowercaseName, "i") } })
        .skip(skip)
        .limit(limit);
    } else {
      totalItems = await userModel.countDocuments();
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No users data",
          null
        );
      }

      users = await userModel.find().skip(skip).limit(limit);
    }

    const totalPages = Math.ceil(totalItems / limit);
    if (page > totalPages) {
      return responseFormatter(
        response,
        400,
        false,
        "Page exceed total pages",
        null
      );
    } else {
      const responseData = {
        items: users,
        meta: {
          total_items: totalItems,
          current_page: page,
          total_pages: totalPages,
          per_page: limit,
        },
      };
      return responseFormatter(
        response,
        200,
        true,
        "Successfully get users data",
        responseData
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.deleteUser = async (request, response) => {
  try {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseFormatter(response, 400, false, "Invalid Id", null);
    }
    const user = await userModel.findByIdAndDelete(id);

    if (!user) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    return responseFormatter(
      response,
      200,
      true,
      "Successfully delete user",
      null
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};