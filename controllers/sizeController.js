const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { addSizeSchema } = require("../utils/validationSchema");
const { responseFormatter } = require("../utils/responseFormatter");

exports.addSize = async (request, response) => {
  try {
    const { error } = addSizeSchema.validate(request.body);
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
    const size = await prisma.size.findFirst({
      where: {
        name: {
          equals: lowercaseName,
        },
      },
    });

    if (!size) {
      const createdSize = await prisma.size.create({
        data,
      });

      return responseFormatter(
        response,
        201,
        true,
        "Successfully Create Size",
        createdSize
      );
    } else {
      return responseFormatter(
        response,
        400,
        false,
        `Size with name ${data?.name} already exists, please look for another name`,
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.deleteSize = async (request, response) => {
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
    const size = await prisma.size.findUnique({
      where: {
        id: id,
      },
    });
    if (!size) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    await prisma.size.delete({
      where: {
        id: id,
      },
    });

    return responseFormatter(
      response,
      200,
      true,
      "Successfully delete size",
      null
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

//with pagination
exports.getSize = async (request, response) => {
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

    let totalItems = await prisma.size.count({
      where: baseWhere,
    });
    if (totalItems === 0) {
      return responseFormatter(response, 404, false, "No sizes data", null);
    }

    let sizes = await prisma.size.findMany({
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
        items: sizes,
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
        "Successfully get sizes data",
        responseData
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.updateSize = async (request, response) => {
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

    const { error } = addSizeSchema.validate(request.body);
    if (error) {
      return responseFormatter(
        response,
        400,
        false,
        error.details[0].message,
        null
      );
    }

    const size = await prisma.size.findUnique({
      where: {
        id: id,
      },
    });
    if (!size) {
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

    const checkSize = await prisma.size.findFirst({
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

    if (!checkSize || checkSize === null) {
      await prisma.size.update({
        where: {
          id: id,
        },
        data: data,
      });
      const updatedItem = await prisma.size.findUnique({
        where: {
          id: id,
        },
      });
      return responseFormatter(
        response,
        200,
        true,
        "Successfully update size",
        updatedItem
      );
    } else {
      return responseFormatter(
        response,
        400,
        false,
        `Size with name ${data.name} already exists, please look for another name`,
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.findSize = async (request, response) => {
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

    const size = await prisma.size.findUnique({
      where: {
        id: id,
      },
    });
    if (!size) {
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
      "Successfully get size",
      size
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

//without pagination
exports.findAll = async (request, response) => {
  try {
    const { name } = request.query;
    let totalItems;
    let sizes;
    const baseWhere = {};

    if (name) {
      baseWhere.name = {
        contains: name.toLowerCase(),
      };
    }

    totalItems = await prisma.size.count({
      where: baseWhere,
    });

    if (totalItems === 0) {
      return responseFormatter(response, 404, false, "No sizes data", null);
    }

    sizes = await prisma.size.findMany({
      where: baseWhere,
    });

    return responseFormatter(
      response,
      200,
      true,
      "Successfully get sizes data",
      sizes
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};
