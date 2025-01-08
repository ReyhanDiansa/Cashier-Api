const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  addOrderSchema,
  updateOrderSchema,
} = require("../utils/validationSchema");
const { responseFormatter } = require("../utils/responseFormatter");
const randomstring = require("randomstring");
const dayjs = require("dayjs");

exports.addOrder = async (request, response) => {
  try {
    const { error } = addOrderSchema.validate(request.body);
    if (error) {
      return responseFormatter(
        response,
        400,
        false,
        error.details[0].message,
        null
      );
    }

    const randomNumber = randomstring.generate({
      length: 3,
      charset: "numeric",
    });
    const timestamp = Date.now();
    const orderId = `ORD-${timestamp}${randomNumber}-MMN`;

    const startTime = dayjs().locale("id");
    const timePlusOneHour = startTime.add(1, "hour");
    const formattedDateTime = timePlusOneHour.toISOString();

    const data = {
      name: request.body.name,
      phone: request.body.phone ?? null,
      email: request.body.email ?? null,
      address: request.body.address ?? null,
      orderId: orderId,
      status: "pending",
      total: 0,
      userId: request.userData.id,
      expiredAt: formattedDateTime,
    };

    try {
      await prisma.$transaction(async (prisma) => {
        let total = 0;
        let orderDetail = [];
        for (const element of request.body.detail) {
          const findProduct = await prisma.product.findUnique({
            where: {
              id: element?.productId,
            },
          });

          if (!findProduct) {
            throw new Error(
              `Cannot find any product with ID ${element?.productId}`
            );
          }

          if (findProduct.stock == 0) {
            throw new Error(
              `The product with ID ${element?.productId} is out of stock, please look for another product`
            );
          }

          if (findProduct.stock < element?.quantity) {
            throw new Error(
              `Insufficient stock for product ID ${element?.productId}, remaining product only ${findProduct.stock} in stock`
            );
          }

          await prisma.product.update({
            where: {
              id: element?.productId,
            },
            data: {
              stock: parseInt(findProduct.stock) - parseInt(element?.quantity),
            },
          });

          let data = {
            orderId,
            productId: element?.productId,
            quantity: element?.quantity,
          };
          orderDetail.push(data);

          total += findProduct.price * element?.quantity;
        }

        data.total = total;

        await prisma.order.create({
          data,
        });
        await prisma.order_Detail.createMany({
          data: orderDetail,
        });
      });

      const orderData = await prisma.order.findUnique({
        where: {
          orderId,
        },
        include: {
          details: {
            include: {
              product: {
                select: {
                  name: true,
                  description: true,
                  sku: true,
                  image: true,
                  price: true,
                  stock: true,
                  size: { select: { id: true, name: true } },
                  color: { select: { id: true, name: true } },
                },
              },
            },
          },
          user: {
            select: { id: true, username: true, email: true },
          },
        },
      });

      orderData.expiredAt = dayjs(orderData.expiredAt).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      orderData.total = parseInt(orderData.total);
      return responseFormatter(
        response,
        201,
        true,
        "Successfully Create Order",
        orderData
      );
    } catch (error) {
      return responseFormatter(response, 400, false, error.message, null);
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.getUserOrder = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = request.userData.id;
    let totalItems;
    let orders;

    totalItems = await prisma.order.count({
      where: {
        userId,
      },
    });
    if (totalItems === 0) {
      return responseFormatter(response, 404, false, "No orders data", null);
    }

    orders = await prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        details: {
          include: {
            product: {
              select: {
                name: true,
                description: true,
                sku: true,
                image: true,
                price: true,
                stock: true,
                size: { select: { id: true, name: true } },
                color: { select: { id: true, name: true } },
              },
            },
          },
        },
        user: {
          select: { id: true, username: true, email: true },
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
        "Page exceed total pages",
        null
      );
    } else {
      const responseData = {
        items: orders,
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
        "Successfully get user order data",
        responseData
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.deleteOrder = async (request, response) => {
  try {
    const id = request.params.id;
    if (!id) {
      return responseFormatter(
        response,
        400,
        false,
        "Id data is Required",
        null
      );
    }
    const order = await prisma.order.findUnique({
      where: {
        orderId: id,
      },
    });
    if (!order) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    if (
      request.userData.role !== "admin" &&
      request.userData.id !== order.userId
    ) {
      return responseFormatter(
        response,
        403,
        false,
        `You are not authorized to delete this data as it belongs to another user.`,
        null
      );
    }

    try {
      await prisma.$transaction(async (prisma) => {
        if (order.status === "pending") {
          const getDetail = await prisma.order_Detail.findMany({
            where: {
              orderId: id,
            },
            include: {
              product: { select: { id: true, name: true, stock: true } },
            },
          });

          for (const element of getDetail) {
            const stockeBeforeOrder = element.quantity + element.product.stock;
            await prisma.product.update({
              where: {
                id: element?.productId,
              },
              data: { stock: stockeBeforeOrder },
            });
          }
        }

        await prisma.order_Detail.deleteMany({
          where: {
            orderId: id,
          },
        });

        await prisma.order.delete({
          where: {
            orderId: id,
          },
        });
      });
      return responseFormatter(
        response,
        200,
        true,
        "Successfully delete order",
        null
      );
    } catch (error) {
      console.error("Transaction failed, rolling back", error);
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.getOrder = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const skip = (page - 1) * limit;
    let totalItems;
    let orders;
    const { keyword } = request.query;
    
    if (keyword) {
      const lowercaseName = keyword.toLowerCase();
      totalItems = await prisma.order.count({
        where: {
          OR: [
            {
              name: {
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
        return responseFormatter(response, 404, false, "No orders data", null);
      }

      orders = await prisma.order.findMany({
        where: {
          OR: [
            {
              name: {
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
        include: {
          details: {
            include: {
              product: {
                select: {
                  name: true,
                  description: true,
                  sku: true,
                  image: true,
                  price: true,
                  stock: true,
                  size: { select: { id: true, name: true } },
                  color: { select: { id: true, name: true } },
                },
              },
            },
          },
          user: {
            select: { id: true, username: true, email: true },
          },
        },
        skip: skip,
        take: limit,
      });
    } else {
      totalItems = await prisma.order.count();
      if (totalItems === 0) {
        return responseFormatter(response, 404, false, "No orders data", null);
      }

      orders = await prisma.order.findMany({
        include: {
          details: {
            include: {
              product: {
                select: {
                  name: true,
                  description: true,
                  sku: true,
                  image: true,
                  price: true,
                  stock: true,
                  size: { select: { id: true, name: true } },
                  color: { select: { id: true, name: true } },
                },
              },
            },
          },
          user: {
            select: { id: true, username: true, email: true },
          },
        },
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
        items: orders,
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
        "Successfully get order data",
        responseData
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.updateOrder = async (request, response) => {
  try {
    const id = request.params.id;
    if (!id) {
      return responseFormatter(
        response,
        400,
        false,
        "order id is Required",
        null
      );
    }

    const { error } = updateOrderSchema.validate(request.body);
    if (error) {
      return responseFormatter(
        response,
        400,
        false,
        error.details[0].message,
        null
      );
    }

    const find = await prisma.order.findUnique({
      where: {
        orderId: id,
      },
    });
    if (!find) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    if (
      request.userData.role !== "admin" &&
      request.userData.id !== find.userId
    ) {
      return responseFormatter(
        response,
        403,
        false,
        `You are not authorized to cancel this data as it belongs to another user.`,
        null
      );
    }

    const data = {
      name: request.body.name,
      phone: request.body.phone,
      email: request.body.email,
      email: request.body.address,
      status: request.body.status,
      total: request.body.total,
      expiredAt: request.body.expiredAt,
    };

    try {
      await prisma.$transaction(async (prisma) => {
        let total = 0;
        let orderDetail = [];
        if (request.body.detail) {
          if (find.status === "done" || find.status === "cancel") {
            throw new Error(
              `You cannot edit this product ordered because its status is already marked as 'done'/'cancel'.`
            );
          }
          
          //If the status before deletion is pending, return the product stock to before ordering
          if (find.status === "pending") {
            const getDetail = await prisma.order_Detail.findMany({
              where: {
                orderId: id,
              },
              include: {
                product: { select: { id: true, name: true, stock: true } },
              },
            });

            for (const element of getDetail) {
              const stockeBeforeOrder =
                element.quantity + element.product.stock;
              await prisma.product.update({
                where: {
                  id: element?.productId,
                },
                data: { stock: stockeBeforeOrder },
              });
            }
          }

          //delete detail
          await prisma.order_Detail.deleteMany({
            where: {
              orderId: id,
            },
          });

          //create new detail
          for (const element of request.body.detail) {
            const findProduct = await prisma.product.findUnique({
              where: {
                id: element?.productId,
              },
            });

            if (!findProduct) {
              throw new Error(
                `Cannot find any product with ID ${element?.productId}`
              );
            }

            if (findProduct.stock == 0) {
              throw new Error(
                `The product with ID ${element?.productId} is out of stock, please look for another product`
              );
            }

            if (findProduct.stock < element?.quantity) {
              throw new Error(
                `Insufficient stock for product ID ${element?.productId}, remaining product only ${findProduct.stock} in stock`
              );
            }

            await prisma.product.update({
              where: {
                id: element?.productId,
              },
              data: {
                stock:
                  parseInt(findProduct.stock) - parseInt(element?.quantity),
              },
            });

            let data = {
              orderId: id,
              productId: element?.productId,
              quantity: element?.quantity,
            };
            orderDetail.push(data);

            total += findProduct.price * element?.quantity;
          }
          data.total = total;
          await prisma.order_Detail.createMany({
            data: orderDetail,
          });
        }

        await prisma.order.update({
          where: {
            orderId: id,
          },
          data: data,
        });
      });

      const orderData = await prisma.order.findUnique({
        where: {
          orderId: id,
        },
        include: {
          details: {
            include: {
              product: {
                select: {
                  name: true,
                  description: true,
                  sku: true,
                  image: true,
                  price: true,
                  stock: true,
                  size: { select: { id: true, name: true } },
                  color: { select: { id: true, name: true } },
                },
              },
            },
          },
          user: {
            select: { id: true, username: true, email: true },
          },
        },
      });

      orderData.expiredAt = dayjs(orderData.expiredAt).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      orderData.total = parseInt(orderData.total);
      return responseFormatter(
        response,
        201,
        true,
        "Successfully Update Order",
        orderData
      );
    } catch (error) {
      return responseFormatter(response, 400, false, error.message, null);
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.findOrder = async (request, response) => {
  try {
    const id = request.params.id;
    if (!id) {
      return responseFormatter(
        response,
        400,
        false,
        "Id data is Required",
        null
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        orderId: id,
      },
      include: {
        details: {
          include: {
            product: {
              select: {
                name: true,
                description: true,
                sku: true,
                image: true,
                price: true,
                stock: true,
                size: { select: { id: true, name: true } },
                color: { select: { id: true, name: true } },
              },
            },
          },
        },
        user: {
          select: { id: true, username: true, email: true },
        },
      },
    });
    if (!order) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }
    order.expiredAt = dayjs(order.expiredAt).format("YYYY-MM-DD HH:mm:ss");
    order.total = parseInt(order.total);
    return responseFormatter(
      response,
      200,
      true,
      "Successfully get order",
      order
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.payOrder = async (request, response) => {
  try {
    const id = request.params.id;
    if (!id) {
      return responseFormatter(
        response,
        400,
        false,
        "Id data is Required",
        null
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        orderId: id,
      },
      include: {
        details: {
          include: {
            product: {
              select: {
                name: true,
                description: true,
                sku: true,
                image: true,
                price: true,
                stock: true,
                size: { select: { id: true, name: true } },
                color: { select: { id: true, name: true } },
              },
            },
          },
        },
        user: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    if (!order) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    if (order.status !== "pending") {
      return responseFormatter(
        response,
        400,
        false,
        `Only orders with a 'pending' status can be pay.`,
        null
      );
    }

    if (
      request.userData.role !== "admin" &&
      request.userData.id !== order.userId
    ) {
      return responseFormatter(
        response,
        403,
        false,
        `You are not authorized to pay this data as it belongs to another user.`,
        null
      );
    }

    const currentTime = dayjs();
    const checkTime = dayjs(order.expiredAt);
    const hasPassed = currentTime.isAfter(checkTime);

    if (hasPassed) {
      return responseFormatter(
        response,
        400,
        false,
        `Payment cannot be processed because the expiration time has already passed.`,
        null
      );
    }

    order.expiredAt = dayjs(order.expiredAt).format("YYYY-MM-DD HH:mm:ss");
    order.total = parseInt(order.total);

    await prisma.order.update({
      where: {
        orderId: id,
      },
      data: {
        status: "done",
      },
    });

    order.status = "done";
    return responseFormatter(
      response,
      200,
      true,
      "Successfully pay order",
      order
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.cancelOrder = async (request, response) => {
  try {
    const id = request.params.id;
    if (!id) {
      return responseFormatter(
        response,
        400,
        false,
        "Id data is Required",
        null
      );
    }
    const order = await prisma.order.findUnique({
      where: {
        orderId: id,
      },
    });
    if (!order) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    if (
      request.userData.role !== "admin" &&
      request.userData.id !== order.userId
    ) {
      return responseFormatter(
        response,
        403,
        false,
        `You are not authorized to cancel this data as it belongs to another user.`,
        null
      );
    }

    if (order.status !== "pending") {
      return responseFormatter(
        response,
        403,
        false,
        `Only orders with a 'pending' status can be canceled.`,
        null
      );
    }

    try {
      await prisma.$transaction(async (prisma) => {
        if (order.status === "pending") {
          const getDetail = await prisma.order_Detail.findMany({
            where: {
              orderId: id,
            },
            include: {
              product: { select: { id: true, name: true, stock: true } },
            },
          });

          for (const element of getDetail) {
            const stockeBeforeOrder = element.quantity + element.product.stock;
            await prisma.product.update({
              where: {
                id: element?.productId,
              },
              data: { stock: stockeBeforeOrder },
            });
          }
        }

        await prisma.order.update({
          where: {
            orderId: id,
          },
          data: { status: "cancel" },
        });
      });
      return responseFormatter(
        response,
        200,
        true,
        "Successfully cancel order",
        null
      );
    } catch (error) {
      return responseFormatter(response, 400, false, error.message, null);
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};
