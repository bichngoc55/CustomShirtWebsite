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
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const query = {};
    if (status) query.status = status;

    // Check if any vouchers have expired and update their status
    await updateExpiredVoucherStatus();

    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const vouchers = await Voucher.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Voucher.countDocuments(query);

    res.status(200).json({
      success: true,
      data: vouchers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    });
  } catch (error) {
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

// Helper function to update expired voucher status
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
};
