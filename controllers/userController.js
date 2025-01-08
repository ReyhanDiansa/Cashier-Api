const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  addUserSchema,
  userUpdateSchema,
} = require("../utils/validationSchema");
const { responseFormatter } = require("../utils/responseFormatter");
const md5 = require("md5");

exports.addUser = async (request, response) => {
  try {
    const { error } = addUserSchema.validate(request.body);
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
      role: request.body.role ?? "helper",
    };

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
        "Successfully Create User",
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

exports.deleteUser = async (request, response) => {
  try {
    const id = parseInt(request.params.id);
    if (!id) {
      return responseFormatter(
        response,
        400,
        false,
        "Id data is Required",
        null
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    if (parseInt(request.userData.id) === id) {
      return responseFormatter(
        response,
        400,
        false,
        `You cannot delete your own account`,
        null
      );
    }

    const checkOrder = await prisma.order.findFirst({
      where: {
        userId: id,
      },
      select: { id: true },
    });

    if (checkOrder) {
      return responseFormatter(
        response,
        400,
        false,
        `Users cannot be deleted because they still have order history`,
        null
      );
    }

    await prisma.user.delete({
      where: {
        id: id,
      },
    });

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

//with pagination
exports.getUser = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const { keyword } = request.query;
    const skip = (page - 1) * limit;
    let totalItems;
    let users;

    if (keyword) {
      const lowercaseName = keyword.toLowerCase();
      totalItems = await prisma.user.count({
        where: {
          OR: [
            {
              username: {
                contains: lowercaseName,
              },
            },
            {
              email: {
                contains: lowercaseName,
              },
            },
          ],
        },
      });
      if (totalItems === 0) {
        return responseFormatter(response, 404, false, "No users data", null);
      }

      users = await prisma.user.findMany({
        where: {
          OR: [
            {
              username: {
                contains: lowercaseName,
              },
            },
            {
              email: {
                contains: lowercaseName,
              },
            },
          ],
        },
        skip: skip,
        take: limit,
      });
    } else {
      totalItems = await prisma.user.count();
      if (totalItems === 0) {
        return responseFormatter(response, 404, false, "No users data", null);
      }

      users = await prisma.user.findMany({
        skip: skip,
        take: limit,
      });
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

exports.updateUser = async (request, response) => {
  try {
    const id = parseInt(request.params.id);
    if (!id) {
      return responseFormatter(
        response,
        400,
        false,
        "Id data is Required",
        null
      );
    }

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

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    const data = {
      username: request.body.username,
      email: request.body.email,
      role: request.body.role,
    };

    if (request.body.password) {
      data.password = md5(request.body.password);
    }
    const lowercaseName = data.username.toLowerCase();
    const lowercaseEmail = data.email.toLowerCase();

    const checkUser = await prisma.user.findFirst({
      where: {
        AND: [
          {
            id: {
              not: id,
            },
          },
          {
            OR: [
              {
                username: {
                  equals: lowercaseName,
                },
              },
              {
                email: {
                  equals: lowercaseEmail,
                },
              },
            ],
          },
        ],
      },
    });

    if (!checkUser) {
      await prisma.user.update({
        where: {
          id: id,
        },
        data: data,
      });
      const updatedItem = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      return responseFormatter(
        response,
        200,
        true,
        "Successfully update user",
        updatedItem
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

exports.findUser = async (request, response) => {
  try {
    const id = parseInt(request.params.id);
    if (!id) {
      return responseFormatter(
        response,
        400,
        false,
        "Id data is Required",
        null
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
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

//without pagination
exports.findAll = async (request, response) => {
  try {
    const { keyword } = request.query;
    let totalItems;
    let users;

    if (keyword) {
      const lowercaseName = keyword.toLowerCase();

      totalItems = await prisma.user.count({
        where: {
          OR: [
            {
              username: {
                contains: lowercaseName,
              },
            },
            {
              email: {
                contains: lowercaseName,
              },
            },
          ],
        },
      });
      if (totalItems === 0) {
        return responseFormatter(response, 404, false, "No users data", null);
      }

      users = await prisma.user.findMany({
        where: {
          OR: [
            {
              username: {
                contains: lowercaseName,
              },
            },
            {
              email: {
                contains: lowercaseName,
              },
            },
          ],
        },
      });
    } else {
      totalItems = await prisma.user.count();
      if (totalItems === 0) {
        return responseFormatter(response, 404, false, "No users data", null);
      }

      users = await prisma.user.findMany();
    }

    return responseFormatter(
      response,
      200,
      true,
      "Successfully get users data",
      users
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};
