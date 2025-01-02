const Voucher = require("../models/Voucher");
const {
  validateVoucherDates,
  validateUniqueVoucherCode,
  validateVoucherStatus,
} = require("../validation/voucherValidation.js");

// Create a new voucher
const createVoucher = async (req, res) => {
  try {
    const {
      name,
      code,
      discount,
      description,
      startDate,
      endDate,
      conditions,
    } = req.body;
    console.log("req body: ", req.body);

    await validateVoucherDates(startDate, endDate);
    await validateUniqueVoucherCode(code);

    const voucher = new Voucher({
      name,
      code,
      discount,
      description,
      startDate,
      endDate,
      conditions,
    });
    console.log("req body: ", req.body);

    await voucher.save();

    res.status(201).json({
      success: true,
      data: voucher,
      message: "Voucher created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getVouchers = async (req, res) => {
  try {
    const { user } = req;
    const currentDate = new Date();
    const orderTotal = req.query.orderTotal
      ? parseFloat(req.query.orderTotal)
      : 0;

    // Delete expired vouchers
    await Voucher.deleteMany({
      endDate: { $lt: currentDate },
    });

    // Base query for active vouchers
    let baseQuery = {
      // startDate: { $gte: currentDate },
      endDate: { $gte: currentDate },
      status: "active",
    };
    console.log("base query: ,",baseQuery);

    let vouchers = [];

    if (user) {
      // Find regular vouchers and birthday vouchers for the user
      const userVouchers = await Voucher.find({
        $or: [
          baseQuery,
          {
            code: { $regex: `BDAY-${user._id}`, $options: "i" },
            status: "active",
          },
        ],
      });

      // Process vouchers and check applicability
      vouchers = userVouchers.map((voucher) => ({
        _id: voucher._id,
        name: voucher.name,
        code: voucher.code,
        discount: voucher.discount,
        description: voucher.description,
        conditions: voucher.conditions,
        isOneTime: voucher.isOneTime,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        isApplicable: true, // You might want to add additional logic here
      }));
    } else {
      // If no user, only get public vouchers
      const publicVouchers = await Voucher.find(baseQuery);
      vouchers = publicVouchers.map((voucher) => ({
        _id: voucher._id,
        name: voucher.name,
        code: voucher.code,
        discount: voucher.discount,
        description: voucher.description,
        conditions: voucher.conditions,
        isOneTime: voucher.isOneTime,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        isApplicable: true, // You might want to add additional logic here
      }));
    }

    // Add special voucher for high-value orders
    if (orderTotal >= 400000) {
      vouchers.push({
        _id: "total-value-special",
        name: "Total Value Discount",
        code: "TOTAL30",
        discount: 30,
        description: "Special discount for orders above 400,000 VND",
        conditions: "Order total must be at least 400,000 VND",
        isOneTime: false,
        startDate: currentDate,
        endDate: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // Valid for 24 hours
        isApplicable: true,
      });
    }

    res.status(200).json({
      success: true,
      data: vouchers,
    });
  } catch (error) {
    console.error("Error in getVouchers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vouchers",
      error: error.message,
    });
  }
};

// Get a single voucher by ID
const getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.status(200).json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching voucher",
      error: error.message,
    });
  }
};

// Update a voucher
const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If updating dates, validate them
    if (updates.startDate && updates.endDate) {
      await validateVoucherDates(updates.startDate, updates.endDate);
    }

    // If updating code, check for uniqueness
    if (updates.code) {
      await validateUniqueVoucherCode(updates.code, id);
    }

    const voucher = await Voucher.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.status(200).json({
      success: true,
      data: voucher,
      message: "Voucher updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a voucher
const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting voucher",
      error: error.message,
    });
  }
};

// Validate a voucher code
const validateVoucher = async (req, res) => {
  try {
    const { code } = req.params;
    console.log(code);
    const voucher = await Voucher.findOne({ code });
    console.log(voucher);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Invalid voucher code",
      });
    }

    await validateVoucherStatus(voucher);

    res.status(200).json({
      success: true,
      data: {
        discount: voucher.discount,
        code: voucher.code,
        conditions: voucher.conditions,
      },
      message: "Voucher is valid",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get voucher statistics
const getVoucherStats = async (req, res) => {
  try {
    const currentDate = new Date();

    const stats = await Voucher.aggregate([
      {
        $facet: {
          statusStats: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          discountStats: [
            {
              $group: {
                _id: null,
                avgDiscount: { $avg: "$discount" },
                maxDiscount: { $max: "$discount" },
                minDiscount: { $min: "$discount" },
              },
            },
          ],
          timeStats: [
            {
              $project: {
                isExpired: { $lt: ["$endDate", currentDate] },
                isActive: {
                  $and: [
                    { $gte: [currentDate, "$startDate"] },
                    { $lte: [currentDate, "$endDate"] },
                  ],
                },
                isFuture: { $gt: ["$startDate", currentDate] },
              },
            },
            {
              $group: {
                _id: null,
                expired: { $sum: { $cond: ["$isExpired", 1, 0] } },
                active: { $sum: { $cond: ["$isActive", 1, 0] } },
                upcoming: { $sum: { $cond: ["$isFuture", 1, 0] } },
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching voucher statistics",
      error: error.message,
    });
  }
};
// create bithrday
const createBirthdayVoucher = async (userId, birthDate) => {
  const currentDate = new Date();
  const userBirthDate = new Date(birthDate);

  const startDate = new Date(
    currentDate.getFullYear(),
    userBirthDate.getMonth(),
    userBirthDate.getDate()
  );
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const birthdayVoucher = new Voucher({
    name: "Birthday Special",
    code: `BDAY-${userId}-${currentDate.getFullYear()}`,
    discount: 20,
    description: "Birthday special 20% discount",
    startDate,
    endDate,
    conditions: "Birthday special offer - one-time use only",
    isOneTime: true,
    status: "active",
  });

  await birthdayVoucher.save();
  return birthdayVoucher;
};
const updateExpiredVoucherStatus = async () => {
  const currentDate = new Date();
  await Voucher.updateMany(
    {
      endDate: { $lt: currentDate },
      status: "active",
    },
    { status: "expired" }
  );
};

module.exports = {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  validateVoucher,
  getVoucherStats,
  createBirthdayVoucher,
  updateExpiredVoucherStatus,
  // updateExpiredVoucherStatus chua lam j
};
