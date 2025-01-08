const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { addColorSchema } = require("../utils/validationSchema");
const { responseFormatter } = require("../utils/responseFormatter");

exports.addColor = async (request, response) => {
  try {
    const { error } = addColorSchema.validate(request.body);
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
      name: request.body.name,
    };

    const lowercaseName = data.name.toLowerCase();
    const color = await prisma.color.findFirst({
      where: {
        name: {
          equals: lowercaseName,
        },
      },
    });

    if (!color) {
      const createdColor = await prisma.color.create({
        data,
      });

      return responseFormatter(
        response,
        201,
        true,
        "Successfully Create Color",
        createdColor
      );
    } else {
      return responseFormatter(
        response,
        400,
        false,
        `Color with name ${data?.name} already exists, please look for another name`,
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.deleteColor = async (request, response) => {
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
    const color = await prisma.color.findUnique({
      where: {
        id: id,
      },
    });
    if (!color) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    await prisma.color.delete({
      where: {
        id: id,
      },
    });

    return responseFormatter(
      response,
      200,
      true,
      "Successfully delete color",
      null
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

//with pagination
exports.getColor = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const { name } = request.query;
    const skip = (page - 1) * limit;
    const baseWhere = {};

    if (name) {
      baseWhere.name = {
        contains: name.toLowerCase(),
      };
    }

    let totalItems = await prisma.color.count({
      where: baseWhere,
    });
    if (totalItems === 0) {
      return responseFormatter(response, 404, false, "No colors data", null);
    }

    let colors = await prisma.color.findMany({
      where: baseWhere,
      skip: skip,
      take: limit,
    });

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
        items: colors,
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
        "Successfully get colors data",
        responseData
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.updateColor = async (request, response) => {
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

    const { error } = addColorSchema.validate(request.body);
    if (error) {
      return responseFormatter(
        response,
        400,
        false,
        error.details[0].message,
        null
      );
    }

    const color = await prisma.color.findUnique({
      where: {
        id: id,
      },
    });
    if (!color) {
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
    };

    const lowercaseName = data.name.toLowerCase();

    const checkColor = await prisma.color.findFirst({
      where: {
        AND: [
          {
            id: {
              not: id,
            },
          },
          {
            name: {
              equals: lowercaseName,
            },
          },
        ],
      },
    });

    if (!checkColor || checkColor === null) {
      await prisma.color.update({
        where: {
          id: id,
        },
        data: data,
      });
      const updatedItem = await prisma.color.findUnique({
        where: {
          id: id,
        },
      });
      return responseFormatter(
        response,
        200,
        true,
        "Successfully update color",
        updatedItem
      );
    } else {
      return responseFormatter(
        response,
        400,
        false,
        `Color with name ${data.name} already exists, please look for another name`,
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.findColor = async (request, response) => {
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

    const color = await prisma.color.findUnique({
      where: {
        id: id,
      },
    });
    if (!color) {
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
      "Successfully get color",
      color
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

//without pagination
exports.findAll = async (request, response) => {
  try {
    const { name } = request.query;
    const baseWhere = {};

    if (name) {
      baseWhere.name = {
        contains: name.toLowerCase(),
      };
    }

    let totalItems = await prisma.color.count({
      where: baseWhere,
    });
    if (totalItems === 0) {
      return responseFormatter(response, 404, false, "No colors data", null);
    }

    let colors = await prisma.color.findMany({ where: baseWhere });

    return responseFormatter(
      response,
      200,
      true,
      "Successfully get colors data",
      colors
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};
