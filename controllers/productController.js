const {
  addProductSchema,
  updateProductSchema,
} = require("../utils/validationSchema");
const { responseFormatter } = require("../utils/responseFormatter");
require("dotenv");
const { deleteFile } = require("../utils/deleteFile");
const upload = require("../utils/upload");
const randomstring = require("randomstring");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.addProduct = [
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return responseFormatter(
        res,
        400,
        false,
        "Product Image is required for this operation. Please upload a valid file and try again.",
        null
      );
    }
    try {
      const { error } = addProductSchema.validate(req.body);
      if (error) {
        await deleteFile(req.file.filename);
        return responseFormatter(
          res,
          400,
          false,
          error.details[0].message,
          null
        );
      }

      const randomSku = randomstring.generate(12);

      const data = {
        name: req.body.name,
        sku: req.body.sku ?? randomSku,
        description: req.body.description,
        price: req.body.price,
        stock: parseInt(req.body.stock),
        image: "",
        sizeId: parseInt(req.body.sizeId) ?? null,
        colorId: parseInt(req.body.colorId) ?? null,
      };

      if (data.sizeId) {
        const checkSize = await prisma.size.findUnique({
          where: {
            id: data.sizeId,
          },
        });

        if (!checkSize) {
          await deleteFile(req.file.filename);
          return responseFormatter(res, 400, false, `Size not found`, null);
        }
      }
      if (data.colorId) {
        const checkColor = await prisma.color.findUnique({
          where: {
            id: data.colorId,
          },
        });

        if (!checkColor) {
          await deleteFile(req.file.filename);
          return responseFormatter(res, 400, false, `Color not found`, null);
        }
      }

      const lowercaseName = data.name.toLowerCase();
      const product = await prisma.product.findFirst({
        where: {
          AND: [
            {
              name: {
                equals: lowercaseName,
              },
            },
            {
              colorId: {
                equals: data.colorId,
              },
            },
            {
              sizeId: {
                equals: data.sizeId,
              },
            },
          ],
        },
      });

      if (!product) {
        data.image = req.file.filename;

        const createdProduct = await prisma.product.create({
          data,
        });
        return responseFormatter(
          res,
          201,
          true,
          "Successfully Create product",
          createdProduct
        );
      } else {
        await deleteFile(req.file.filename);
        return responseFormatter(
          res,
          400,
          false,
          `Product with that name, size and color already exists, please look for another one`,
          null
        );
      }
    } catch (error) {
      await deleteFile(req.file.filename);
      return responseFormatter(res, 500, false, error.message, null);
    }
  },
];

exports.deleteProduct = async (request, response) => {
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

    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
    });
    if (!product) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    const deleteImage = await deleteFile(product.image);

    if (deleteImage) {
      await prisma.product.delete({
        where: {
          id: id,
        },
      });
      return responseFormatter(
        response,
        200,
        true,
        "Successfully delete product",
        null
      );
    } else {
      return responseFormatter(
        response,
        400,
        false,
        `Failed delete product image`,
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

//with pagination
exports.getProduct = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const { name, available } = request.query;
    const isAvailable = available === "true";
    const skip = (page - 1) * limit;
    let totalItems;
    let products;

    const baseWhere = {};

    if (name) {
      baseWhere.name = {
        contains: name.toLowerCase(),
      };
    }

    if (isAvailable) {
      baseWhere.stock = {
        not: 0,
      };
    }

    totalItems = await prisma.product.count({
      where: baseWhere,
    });

    if (totalItems === 0) {
      return responseFormatter(response, 404, false, "No products data", null);
    }

    products = await prisma.product.findMany({
      where: baseWhere,
      include: {
        color: {
          select: { id: true, name: true },
        },
        size: {
          select: { id: true, name: true },
        },
      },
      skip: skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    if (page > totalPages) {
      return responseFormatter(
        response,
        400,
        false,
        "Page exceeds total pages",
        null
      );
    } else {
      const responseData = {
        items: products,
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
        "Successfully get products data",
        responseData
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.updateProduct = [
  upload.single("image"),
  async (request, response) => {
    try {
      const { error } = updateProductSchema.validate(request.body);
      if (error) {
        if (request.file) {
          await deleteFile(request.file.filename);
        }
        return responseFormatter(
          response,
          400,
          false,
          error.details[0].message,
          null
        );
      }
      const id = parseInt(request.params.id);

      if (!id) {
        if (request.file) {
          await deleteFile(request.file.filename);
        }
        return responseFormatter(
          response,
          400,
          false,
          "Id data is Required",
          null
        );
      }

      const find = await prisma.product.findUnique({
        where: {
          id: id,
        },
      });
      if (!find) {
        if (request.file) {
          await deleteFile(request.file.filename);
        }
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
        sku: request.body.sku,
        description: request.body.description,
        price: request.body.price,
        stock: parseInt(request.body.stock),
        image: "",
        sizeId: parseInt(request.body.sizeId),
        colorId: parseInt(request.body.colorId),
      };

      if (data.sizeId) {
        const checkSize = await prisma.size.findUnique({
          where: {
            id: data.sizeId,
          },
        });

        if (!checkSize) {
          if (request.file) {
            await deleteFile(request.file.filename);
          }
          return responseFormatter(
            response,
            400,
            false,
            `Size not found`,
            null
          );
        }
      }
      if (data.colorId) {
        const checkColor = await prisma.color.findUnique({
          where: {
            id: data.colorId,
          },
        });

        if (!checkColor) {
          if (request.file) {
            await deleteFile(request.file.filename);
          }
          return responseFormatter(
            response,
            400,
            false,
            `Color not found`,
            null
          );
        }
      }

      const lowercaseName = data.name.toLowerCase();
      const checkProduct = await prisma.product.findFirst({
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
            {
              colorId: {
                equals: data.colorId,
              },
            },
            {
              sizeId: {
                equals: data.sizeId,
              },
            },
          ],
        },
      });

      if (!checkProduct) {
        if (request.file) {
          // Delete the old file if exists
          if (find.image) {
            await deleteFile(find.image);
          }

          // Save new image
          data.image = request.file.filename;
        } else {
          data.image = find.image;
        }

        await prisma.product.update({
          where: {
            id: id,
          },
          data: data,
        });
        const updatedProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
        });

        return responseFormatter(
          response,
          200,
          true,
          "Successfully update product",
          updatedProduct
        );
      } else {
        if (request.file) {
          await deleteFile(request.file.filename);
        }
        return responseFormatter(
          response,
          400,
          false,
          `Product with name, size and color already exists, please look for another one`,
          null
        );
      }
    } catch (error) {
      if (request.file) {
        await deleteFile(request.file.filename);
      }
      return responseFormatter(response, 500, false, error.message, null);
    }
  },
];

exports.findProduct = async (request, response) => {
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

    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
      include: {
        color: {
          select: { id: true, name: true },
        },
        size: {
          select: { id: true, name: true },
        },
      },
    });
    if (!product) {
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
      "Successfully get product",
      product
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

//without pagination
exports.findAll = async (request, response) => {
  try {
    const { name, available } = request.query;
    const isAvailable = available === "true";
    let totalItems;
    let products;

    const baseWhere = {};

    if (name) {
      baseWhere.name = {
        contains: name.toLowerCase(),
      };
    }

    if (isAvailable) {
      baseWhere.stock = {
        not: 0,
      };
    }

    totalItems = await prisma.product.count({
      where: baseWhere,
    });

    if (totalItems === 0) {
      return responseFormatter(response, 404, false, "No products data", null);
    }

    products = await prisma.product.findMany({
      where: baseWhere,
      include: {
        color: {
          select: { id: true, name: true },
        },
        size: {
          select: { id: true, name: true },
        },
      },
    });

    return responseFormatter(
      response,
      200,
      true,
      "Successfully retrieved products data",
      products
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};
